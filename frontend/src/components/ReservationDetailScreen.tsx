import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { ReservationCancelDialog } from './ReservationCancelDialog';
import { ReservationDetailCard } from './ReservationDetailCard';
import { ReservationEditDialog } from './ReservationEditDialog';
import type { Reservation } from '../types/reservation';
import { reservationDetailQueryContent } from '../utils/reservationDetailView';

type ReservationDetailScreenProps = Readonly<{
  backTo: string;
  backLabel: string;
  showBookedBy: boolean;
  reservation: Reservation | null;
  isLoading: boolean;
  error: string | null;
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  cancelOpen: boolean;
  onCancelOpenChange: (open: boolean) => void;
  isCancelling: boolean;
  onCancelConfirm: () => void;
  canEdit: boolean;
  canCancel: boolean;
  onReservationUpdated: (reservation: Reservation) => void;
  cancelDialogMessage: ReactNode;
}>;

export function ReservationDetailScreen({
  backTo,
  backLabel,
  showBookedBy,
  reservation,
  isLoading,
  error,
  editOpen,
  onEditOpenChange,
  cancelOpen,
  onCancelOpenChange,
  isCancelling,
  onCancelConfirm,
  canEdit,
  canCancel,
  onReservationUpdated,
  cancelDialogMessage,
}: ReservationDetailScreenProps) {
  const detailCard = reservation ? (
    <ReservationDetailCard
      reservation={reservation}
      showBookedBy={showBookedBy}
      canEdit={canEdit}
      canCancel={canCancel}
      onEdit={() => {
        onEditOpenChange(true);
      }}
      onCancel={() => {
        onCancelOpenChange(true);
      }}
    />
  ) : null;

  return (
    <AppLayout maxWidth="md">
      <Stack spacing={2}>
        <Button component={RouterLink} to={backTo} variant="text" sx={{ alignSelf: 'flex-start' }}>
          {backLabel}
        </Button>

        {reservationDetailQueryContent(isLoading, error, detailCard)}
      </Stack>

      {reservation && (
        <ReservationEditDialog
          open={editOpen}
          reservation={reservation}
          onClose={() => {
            onEditOpenChange(false);
          }}
          onSuccess={onReservationUpdated}
        />
      )}

      <ReservationCancelDialog
        open={cancelOpen}
        onClose={() => {
          onCancelOpenChange(false);
        }}
        onConfirm={onCancelConfirm}
        isCancelling={isCancelling}
      >
        {cancelDialogMessage}
      </ReservationCancelDialog>
    </AppLayout>
  );
}
