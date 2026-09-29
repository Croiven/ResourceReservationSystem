import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { Reservation } from '../types/reservation';
import { isReservationCancellable, isReservationEditable } from '../utils/reservationRules';

type ReservationRowActionsProps = Readonly<{
  reservation: Reservation;
  onEdit: (reservation: Reservation) => void;
  onCancel: (reservation: Reservation) => void;
}>;

export function ReservationRowActions({ reservation, onEdit, onCancel }: ReservationRowActionsProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
      <Button
        size="small"
        disabled={!isReservationEditable(reservation)}
        onClick={(event) => {
          event.stopPropagation();
          onEdit(reservation);
        }}
      >
        Edit
      </Button>
      <Button
        size="small"
        color="error"
        disabled={!isReservationCancellable(reservation)}
        onClick={(event) => {
          event.stopPropagation();
          onCancel(reservation);
        }}
      >
        Cancel
      </Button>
    </Stack>
  );
}
