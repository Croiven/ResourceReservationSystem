import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ReactNode, SyntheticEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CenteredLoading } from '../components/CenteredLoading';
import { ResourceBookingsCalendar } from '../components/ResourceBookingsCalendar';
import { SlotDateTimeField } from '../components/SlotDateTimeField';
import type { ResourceBooking } from '../types/reservation';
import type { Resource } from '../types/resource';
import { formatDateTimeRange, toIsoDateTime } from '../utils/dateTime';
import { getResourceTypeLabel } from '../utils/resourceLabels';
import {
  formatSlotDuration,
  getMinEndDateTimeLocal,
  getMinStartDateTimeLocal,
  getSlotDurationMinutes,
  isLocalDateTimeBefore,
  isValidSlotRange,
} from '../utils/slotTime';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function availabilityAlertSeverity(message: string): 'success' | 'warning' {
  if (message === 'This time slot is available.') {
    return 'success';
  }
  return 'warning';
}

function resourceDetailMainContent(
  isLoading: boolean,
  notFound: boolean,
  error: string | null,
  resource: Resource | null,
  onBrowseResources: ReactNode,
  loadedContent: (resource: Resource) => ReactNode,
): ReactNode {
  if (isLoading) {
    return <CenteredLoading />;
  }
  if (notFound) {
    return (
      <Stack spacing={2}>
        <Alert severity="warning">Resource not found.</Alert>
        {onBrowseResources}
      </Stack>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!resource) {
    return null;
  }
  return loadedContent(resource);
}

type ResourceBookingPanelProps = Readonly<{
  resourceId: string;
  resource: Resource;
  isAuthenticated: boolean;
  startTime: string;
  endTime: string;
  notes: string;
  bookingError: string | null;
  availabilityMessage: string | null;
  isSubmitting: boolean;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
}>;

function ResourceBookingPanel({
  resourceId,
  resource,
  isAuthenticated,
  startTime,
  endTime,
  notes,
  bookingError,
  availabilityMessage,
  isSubmitting,
  onStartTimeChange,
  onEndTimeChange,
  onNotesChange,
  onSubmit,
}: ResourceBookingPanelProps) {
  const minStartTime = getMinStartDateTimeLocal();
  const minEndTime = startTime ? getMinEndDateTimeLocal(startTime) : '';

  if (!isAuthenticated) {
    return (
      <Alert severity="info">
        <Button component={RouterLink} to="/login" state={{ from: `/resources/${resourceId}` }}>
          Sign in
        </Button>{' '}
        to make a reservation.
      </Alert>
    );
  }

  if (!resource.isActive) {
    return <Alert severity="warning">This resource is not available for booking.</Alert>;
  }

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {bookingError && <Alert severity="error">{bookingError}</Alert>}
        {availabilityMessage && (
          <Alert severity={availabilityAlertSeverity(availabilityMessage)}>{availabilityMessage}</Alert>
        )}
        <SlotDateTimeField
          label="Start time"
          value={startTime}
          onChange={onStartTimeChange}
          min={minStartTime}
          required
        />
        <SlotDateTimeField
          label="End time"
          value={endTime}
          onChange={onEndTimeChange}
          min={minEndTime}
          disabled={!startTime}
          required
          helperText={
            startTime
              ? 'Must be after start time, on the hour or half-hour'
              : 'Select a start time first'
          }
        />
        {startTime && endTime && isValidSlotRange(startTime, endTime) && (
          <Typography variant="body2" color="text.secondary">
            {formatDateTimeRange(toIsoDateTime(startTime), toIsoDateTime(endTime))}
            {' · '}
            {formatSlotDuration(getSlotDurationMinutes(startTime, endTime))}
          </Typography>
        )}
        <TextField
          label="Notes"
          value={notes}
          onChange={(event) => {
            onNotesChange(event.target.value);
          }}
          fullWidth
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Book resource'}
        </Button>
      </Stack>
    </Box>
  );
}

export type ResourceDetailPageContentProps = Readonly<{
  resourceId: string | undefined;
  isAuthenticated: boolean;
  resource: Resource | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
  weekStart: Date;
  onWeekChange: (next: Date) => void;
  bookings: ResourceBooking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  startTime: string;
  endTime: string;
  notes: string;
  bookingError: string | null;
  availabilityMessage: string | null;
  isSubmitting: boolean;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmitBooking: () => void;
}>;

export function ResourceDetailPageContent({
  resourceId,
  isAuthenticated,
  resource,
  isLoading,
  notFound,
  error,
  weekStart,
  onWeekChange,
  bookings,
  bookingsLoading,
  bookingsError,
  startTime,
  endTime,
  notes,
  bookingError,
  availabilityMessage,
  isSubmitting,
  onStartTimeChange,
  onEndTimeChange,
  onNotesChange,
  onSubmitBooking,
}: ResourceDetailPageContentProps) {
  const handleStartTimeChange = (value: string) => {
    onStartTimeChange(value);
    if (endTime && value && isLocalDateTimeBefore(endTime, getMinEndDateTimeLocal(value))) {
      onEndTimeChange('');
    }
  };

  return resourceDetailMainContent(
    isLoading,
    notFound,
    error,
    resource,
    <Button component={RouterLink} to="/resources" variant="contained">
      Browse resources
    </Button>,
    (loadedResource) => (
      <Stack spacing={3}>
        <Card>
          <CardHeader
            title={loadedResource.name}
            subheader={`Added ${formatDate(loadedResource.createdAt)}`}
            action={
              <Stack direction="row" spacing={1}>
                <Chip label={getResourceTypeLabel(loadedResource.type)} size="small" />
                <Chip
                  label={loadedResource.isActive ? 'Active' : 'Inactive'}
                  color={loadedResource.isActive ? 'success' : 'default'}
                  size="small"
                  variant={loadedResource.isActive ? 'filled' : 'outlined'}
                />
              </Stack>
            }
          />
          <CardContent>
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {loadedResource.description ?? 'No description provided.'}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Availability calendar"
            subheader="Booked time slots shown in 30-minute increments"
          />
          <CardContent>
            <Stack spacing={2}>
              {bookingsError && <Alert severity="error">{bookingsError}</Alert>}

              <ResourceBookingsCalendar
                bookings={bookings}
                weekStart={weekStart}
                onWeekChange={onWeekChange}
                loading={bookingsLoading}
              />
              {!bookingsLoading && bookings.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                  No bookings in this week.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Book this resource" />
          <CardContent>
            {resourceId && (
              <ResourceBookingPanel
                resourceId={resourceId}
                resource={loadedResource}
                isAuthenticated={isAuthenticated}
                startTime={startTime}
                endTime={endTime}
                notes={notes}
                bookingError={bookingError}
                availabilityMessage={availabilityMessage}
                isSubmitting={isSubmitting}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={onEndTimeChange}
                onNotesChange={onNotesChange}
                onSubmit={onSubmitBooking}
              />
            )}
          </CardContent>
        </Card>
      </Stack>
    ),
  );
}
