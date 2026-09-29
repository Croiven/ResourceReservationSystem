import { useParams } from 'react-router-dom';
import { ReservationDetailScreen } from '../components/ReservationDetailScreen';
import { useReservationDetail } from '../hooks/useReservationDetail';

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useReservationDetail(id);

  return (
    <ReservationDetailScreen
      backTo="/reservations"
      backLabel="Back to my reservations"
      showBookedBy={false}
      reservation={detail.reservation}
      isLoading={detail.isLoading}
      error={detail.error}
      editOpen={detail.editOpen}
      onEditOpenChange={detail.setEditOpen}
      cancelOpen={detail.cancelOpen}
      onCancelOpenChange={detail.setCancelOpen}
      isCancelling={detail.isCancelling}
      onCancelConfirm={() => {
        void detail.handleCancel();
      }}
      canEdit={detail.canEdit}
      canCancel={detail.canCancel}
      onReservationUpdated={detail.setReservation}
      cancelDialogMessage={<>This will cancel your booking for {detail.reservation?.resource.name}.</>}
    />
  );
}
