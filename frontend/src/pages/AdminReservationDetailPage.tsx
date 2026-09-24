import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ReservationEditDialog } from '../components/ReservationEditDialog';
import * as reservationApi from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import { formatDateTimeRange } from '../utils/dateTime';
import { getReservationStatusLabel, getStatusChipColor } from '../utils/reservationLabels';
import { isReservationCancellable, isReservationEditable } from '../utils/reservationRules';

export function AdminReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadReservation = async () => {
      const tokens = getTokens();
      if (!tokens?.accessToken) {
        if (!cancelled) {
          setError('You must be signed in to view this reservation.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await reservationApi.getReservation(id, tokens.accessToken);
        if (!cancelled) {
          setReservation(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setError('Reservation not found.');
          } else if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Unable to load reservation. Please try again.');
          }
          setReservation(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReservation();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCancel = async () => {
    if (!reservation) return;

    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    setIsCancelling(true);
    try {
      const updated = await reservationApi.cancelReservation(reservation.id, tokens.accessToken);
      setReservation(updated);
      setCancelOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to cancel reservation. Please try again.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const canEdit = reservation ? isReservationEditable(reservation) : false;
  const canCancel = reservation ? isReservationCancellable(reservation) : false;

  return (
    <AppLayout maxWidth="md">
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/admin/reservations"
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to all reservations
        </Button>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : reservation ? (
          <Card>
            <CardHeader
              title={reservation.resource.name}
              subheader={formatDateTimeRange(reservation.startTime, reservation.endTime)}
              action={
                <Chip
                  label={getReservationStatusLabel(reservation.status)}
                  color={getStatusChipColor(reservation.status)}
                  size="small"
                  variant={reservation.status === 'CANCELLED' ? 'outlined' : 'filled'}
                />
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Booked by: {reservation.user.firstName} {reservation.user.lastName} (
                  {reservation.user.email})
                </Typography>
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
                  <Button variant="contained" disabled={!canEdit} onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={!canCancel}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel reservation
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </Stack>

      {reservation && (
        <ReservationEditDialog
          open={editOpen}
          reservation={reservation}
          onClose={() => setEditOpen(false)}
          onSuccess={(updated) => {
            setReservation(updated);
          }}
        />
      )}

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>Cancel reservation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel the booking for {reservation?.resource.name} by{' '}
            {reservation?.user.firstName} {reservation?.user.lastName}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={isCancelling}>
            Keep reservation
          </Button>
          <Button onClick={() => void handleCancel()} color="error" disabled={isCancelling}>
            {isCancelling ? 'Cancelling…' : 'Cancel reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
