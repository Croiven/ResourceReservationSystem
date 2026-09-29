import Chip from '@mui/material/Chip';
import type { Reservation } from '../types/reservation';
import { getReservationStatusLabel, getStatusChipColor } from '../utils/reservationLabels';

type ReservationStatusChipProps = Readonly<{
  reservation: Reservation;
}>;

export function ReservationStatusChip({ reservation }: ReservationStatusChipProps) {
  return (
    <Chip
      label={getReservationStatusLabel(reservation.status)}
      color={getStatusChipColor(reservation.status)}
      size="small"
      variant={reservation.status === 'CANCELLED' ? 'outlined' : 'filled'}
    />
  );
}
