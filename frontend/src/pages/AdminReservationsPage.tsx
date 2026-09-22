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
import * as adminReservationApi from '../services/adminReservationApi';
import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import * as userApi from '../services/userApi';
import { getTokens } from '../services/tokenStorage';
import type { AdminListReservationsQuery, Reservation } from '../types/reservation';
import type { Resource } from '../types/resource';
import type { User } from '../types/user';
import { ApiError } from '../types/api';
import { formatDateTimeRange } from '../utils/dateTime';
import {
  getReservationStatusLabel,
  getStatusChipColor,
  STATUS_FILTER_OPTIONS,
  type StatusFilter,
} from '../utils/reservationLabels';

export function AdminReservationsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userFilter, setUserFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    void (async () => {
      try {
        const [userList, resourceList] = await Promise.all([
          userApi.listUsers(tokens.accessToken),
          resourceApi.listResources(),
        ]);
        setUsers(userList);
        setResources(resourceList);
      } catch {
        // Filter dropdowns are optional; list load handles errors.
      }
    })();
  }, []);

  const loadReservations = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to view reservations.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const query: AdminListReservationsQuery = {};
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }
    if (userFilter !== '') {
      query.userId = userFilter;
    }
    if (resourceFilter !== '') {
      query.resourceId = resourceFilter;
    }

    try {
      const data = await adminReservationApi.listAllReservations(
        Object.keys(query).length > 0 ? query : undefined,
        tokens.accessToken,
      );
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
  }, [statusFilter, userFilter, resourceFilter]);

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

  const isActive = (reservation: Reservation) => reservation.status !== 'CANCELLED';

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          All reservations
        </Typography>

        <Paper sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
          >
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="admin-reservation-status-filter-label">Status</InputLabel>
              <Select
                labelId="admin-reservation-status-filter-label"
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="admin-reservation-user-filter-label">User</InputLabel>
              <Select
                labelId="admin-reservation-user-filter-label"
                label="User"
                value={userFilter}
                onChange={(event) => {
                  setUserFilter(event.target.value);
                }}
              >
                <MenuItem value="">All users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="admin-reservation-resource-filter-label">Resource</InputLabel>
              <Select
                labelId="admin-reservation-resource-filter-label"
                label="Resource"
                value={resourceFilter}
                onChange={(event) => {
                  setResourceFilter(event.target.value);
                }}
              >
                <MenuItem value="">All resources</MenuItem>
                {resources.map((resource) => (
                  <MenuItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : reservations.length === 0 ? (
          <Typography color="text.secondary">No reservations match your filters.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
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
                      void navigate(`/admin/reservations/${reservation.id}`);
                    }}
                  >
                    <TableCell>
                      {reservation.user.firstName} {reservation.user.lastName}
                      <Typography variant="body2" color="text.secondary">
                        {reservation.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={`/resources/${reservation.resourceId}`}
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        {reservation.resource.name}
                      </Button>
                    </TableCell>
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
                          disabled={!isActive(reservation)}
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
                          disabled={!isActive(reservation)}
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
            This will cancel the booking for {cancelReservation?.resource.name} by{' '}
            {cancelReservation?.user.firstName} {cancelReservation?.user.lastName}.
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
