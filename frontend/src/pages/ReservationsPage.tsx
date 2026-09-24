import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ReservationEditDialog } from '../components/ReservationEditDialog';
import * as reservationApi from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import { formatDateTimeRange } from '../utils/dateTime';
import {
  getReservationStatusLabel,
  getStatusChipColor,
  STATUS_FILTER_OPTIONS,
  type StatusFilter,
} from '../utils/reservationLabels';
import { isReservationCancellable, isReservationEditable } from '../utils/reservationRules';

export function ReservationsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadReservations = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to view reservations.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = statusFilter === 'all' ? undefined : { status: statusFilter };
      const data = await reservationApi.listReservations(query, tokens.accessToken);
      setReservations(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to load reservations. Please try again.');
      }
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const handleCancelConfirm = async () => {
    if (!cancelReservation) return;

    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    setIsCancelling(true);
    try {
      await reservationApi.cancelReservation(cancelReservation.id, tokens.accessToken);
      setCancelReservation(null);
      await loadReservations();
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

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          My Reservations
        </Typography>

        <Paper sx={{ p: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="reservation-status-filter-label">Status</InputLabel>
            <Select
              labelId="reservation-status-filter-label"
              label="Status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
              }}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : reservations.length === 0 ? (
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography color="text.secondary">You have no reservations.</Typography>
            <Button variant="contained" component={RouterLink} to="/resources">
              Browse resources
            </Button>
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resource</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow
                    key={reservation.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      void navigate(`/reservations/${reservation.id}`);
                    }}
                  >
                    <TableCell>{reservation.resource.name}</TableCell>
                    <TableCell>{formatDateTimeRange(reservation.startTime, reservation.endTime)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getReservationStatusLabel(reservation.status)}
                        color={getStatusChipColor(reservation.status)}
                        size="small"
                        variant={reservation.status === 'CANCELLED' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          disabled={!isReservationEditable(reservation)}
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditReservation(reservation);
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
                            setCancelReservation(reservation);
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {editReservation && (
        <ReservationEditDialog
          open
          reservation={editReservation}
          onClose={() => {
            setEditReservation(null);
          }}
          onSuccess={() => {
            void loadReservations();
          }}
        />
      )}

      <Dialog open={cancelReservation !== null} onClose={() => setCancelReservation(null)}>
        <DialogTitle>Cancel reservation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel your booking for {cancelReservation?.resource.name}. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelReservation(null)} disabled={isCancelling}>
            Keep reservation
          </Button>
          <Button onClick={() => void handleCancelConfirm()} color="error" disabled={isCancelling}>
            {isCancelling ? 'Cancelling…' : 'Cancel reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
