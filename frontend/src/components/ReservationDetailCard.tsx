import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { Reservation } from '../types/reservation';
import { formatDateTimeRange } from '../utils/dateTime';
import { ReservationStatusChip } from './ReservationStatusChip';

type ReservationDetailCardProps = Readonly<{
  reservation: Reservation;
  showBookedBy: boolean;
  canEdit: boolean;
  canCancel: boolean;
  onEdit: () => void;
  onCancel: () => void;
}>;

export function ReservationDetailCard({
  reservation,
  showBookedBy,
  canEdit,
  canCancel,
  onEdit,
  onCancel,
}: ReservationDetailCardProps) {
  return (
    <Card>
      <CardHeader
        title={reservation.resource.name}
        subheader={formatDateTimeRange(reservation.startTime, reservation.endTime)}
        action={<ReservationStatusChip reservation={reservation} />}
      />
      <CardContent>
        <Stack spacing={2}>
          {showBookedBy && (
            <Typography variant="body2" color="text.secondary">
              Booked by: {reservation.user.firstName} {reservation.user.lastName} ({reservation.user.email})
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Resource:{' '}
            <Button
              component={RouterLink}
              to={`/resources/${reservation.resourceId}`}
              size="small"
              sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}
            >
              View resource
            </Button>
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {reservation.notes ?? 'No notes provided.'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" disabled={!canEdit} onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outlined" color="error" disabled={!canCancel} onClick={onCancel}>
              Cancel reservation
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
