import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { useResourceDetailPage } from '../hooks/useResourceDetailPage';
import { ResourceDetailPageContent } from './ResourceDetailPageContent';

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const page = useResourceDetailPage(id);

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={2}>
        <Button component={RouterLink} to="/resources" variant="text" sx={{ alignSelf: 'flex-start' }}>
          Back to resources
        </Button>

        <ResourceDetailPageContent
          resourceId={id}
          isAuthenticated={isAuthenticated}
          resource={page.resource}
          isLoading={page.isLoading}
          notFound={page.notFound}
          error={page.error}
          weekStart={page.weekStart}
          onWeekChange={page.setWeekStart}
          bookings={page.bookings}
          bookingsLoading={page.bookingsLoading}
          bookingsError={page.bookingsError}
          startTime={page.startTime}
          endTime={page.endTime}
          notes={page.notes}
          bookingError={page.bookingError}
          availabilityMessage={page.availabilityMessage}
          isSubmitting={page.isSubmitting}
          onStartTimeChange={page.setStartTime}
          onEndTimeChange={page.setEndTime}
          onNotesChange={page.setNotes}
          onSubmitBooking={() => {
            void page.submitBooking();
          }}
        />
      </Stack>
    </AppLayout>
  );
}
