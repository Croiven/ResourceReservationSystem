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
import { type FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ResourceBookingsCalendar } from '../components/ResourceBookingsCalendar';
import { SlotDateTimeField } from '../components/SlotDateTimeField';
import { useAuth } from '../hooks/useAuth';
import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
import type { ResourceBooking } from '../types/reservation';
import type { Resource } from '../types/resource';
import { ApiError } from '../types/api';
import { getWeekStart, weekRangeIso } from '../utils/calendar';
import { formatDateTimeRange, toIsoDateTime } from '../utils/dateTime';
import { getResourceTypeLabel } from '../utils/resourceLabels';
import {
  formatSlotDuration,
  getLocalSlotRangeFeedback,
  getMinEndDateTimeLocal,
  getMinStartDateTimeLocal,
  getSlotDurationMinutes,
  isLocalDateTimeBefore,
  isValidSlotRange,
  slotAvailabilityFeedback,
} from '../utils/slotTime';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minStartTime = getMinStartDateTimeLocal();
  const minEndTime = startTime ? getMinEndDateTimeLocal(startTime) : '';

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (endTime && value && isLocalDateTimeBefore(endTime, getMinEndDateTimeLocal(value))) {
      setEndTime('');
    }
  };

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadResource = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await resourceApi.getResource(id);
        if (!cancelled) {
          setResource(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setNotFound(true);
            setResource(null);
          } else if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Unable to load resource. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const { from, to } = weekRangeIso(weekStart);

    const loadBookings = async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      setBookings([]);

      try {
        const data = await resourceApi.getResourceBookings(id, from, to);
        if (!cancelled) {
          setBookings(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setBookingsError(err.message);
          } else {
            setBookingsError('Unable to load availability.');
          }
          setBookings([]);
        }
      } finally {
        if (!cancelled) {
          setBookingsLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [id, weekStart]);

  useEffect(() => {
    if (!id || !startTime || !endTime) {
      setAvailabilityMessage(null);
      return;
    }

    const localFeedback = getLocalSlotRangeFeedback(startTime, endTime);
    if (localFeedback) {
      setAvailabilityMessage(localFeedback.message);
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const result = await resourceApi.checkAvailability(
            id,
            toIsoDateTime(startTime),
            toIsoDateTime(endTime),
          );
          setAvailabilityMessage(slotAvailabilityFeedback(result.available).message);
        } catch {
          setAvailabilityMessage(null);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [id, startTime, endTime]);

  const handleBookingSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBookingError(null);

    if (!id || !startTime || !endTime) {
      setBookingError('Start and end times are required.');
      return;
    }

    if (!isValidSlotRange(startTime, endTime)) {
      setBookingError(
        'Reservations must start on the hour or half-hour and last a multiple of 30 minutes.',
      );
      return;
    }

    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setBookingError('You must be signed in to book.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await reservationApi.createReservation(
        {
          resourceId: id,
          startTime: toIsoDateTime(startTime),
          endTime: toIsoDateTime(endTime),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
        tokens.accessToken,
      );
      void navigate(`/reservations/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setBookingError(err.message);
      } else {
        setBookingError('Unable to create reservation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={2}>
        <Button component={RouterLink} to="/resources" variant="text" sx={{ alignSelf: 'flex-start' }}>
          Back to resources
        </Button>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notFound ? (
          <Stack spacing={2}>
            <Alert severity="warning">Resource not found.</Alert>
            <Button component={RouterLink} to="/resources" variant="contained">
              Browse resources
            </Button>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resource ? (
          <Stack spacing={3}>
            <Card>
              <CardHeader
                title={resource.name}
                subheader={`Added ${formatDate(resource.createdAt)}`}
                action={
                  <Stack direction="row" spacing={1}>
                    <Chip label={getResourceTypeLabel(resource.type)} size="small" />
                    <Chip
                      label={resource.isActive ? 'Active' : 'Inactive'}
                      color={resource.isActive ? 'success' : 'default'}
                      size="small"
                      variant={resource.isActive ? 'filled' : 'outlined'}
                    />
                  </Stack>
                }
              />
              <CardContent>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {resource.description ?? 'No description provided.'}
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
                    onWeekChange={setWeekStart}
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
                {!isAuthenticated ? (
                  <Alert severity="info">
                    <Button component={RouterLink} to="/login" state={{ from: `/resources/${id}` }}>
                      Sign in
                    </Button>{' '}
                    to make a reservation.
                  </Alert>
                ) : !resource.isActive ? (
                  <Alert severity="warning">This resource is not available for booking.</Alert>
                ) : (
                  <Box component="form" onSubmit={(event) => void handleBookingSubmit(event)}>
                    <Stack spacing={2}>
                      {bookingError && <Alert severity="error">{bookingError}</Alert>}
                      {availabilityMessage && (
                        <Alert
                          severity={
                            availabilityMessage === 'This time slot is available.'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {availabilityMessage}
                        </Alert>
                      )}
                      <SlotDateTimeField
                        label="Start time"
                        value={startTime}
                        onChange={handleStartTimeChange}
                        min={minStartTime}
                        required
                      />
                      <SlotDateTimeField
                        label="End time"
                        value={endTime}
                        onChange={setEndTime}
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
                        onChange={(event) => setNotes(event.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                      />
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Book resource'}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </Stack>
    </AppLayout>
  );
}
