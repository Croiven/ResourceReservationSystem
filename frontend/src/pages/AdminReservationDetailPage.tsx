import { useParams } from 'react-router-dom';
import { ReservationDetailScreen } from '../components/ReservationDetailScreen';
import { useReservationDetail } from '../hooks/useReservationDetail';

export function AdminReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useReservationDetail(id);

  return (
    <ReservationDetailScreen
      backTo="/admin/reservations"
      backLabel="Back to all reservations"
      showBookedBy
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
      cancelDialogMessage={
        <>
          This will cancel the booking for {detail.reservation?.resource.name} by{' '}
          {detail.reservation?.user.firstName} {detail.reservation?.user.lastName}.
        </>
      }
    />
  );
}
