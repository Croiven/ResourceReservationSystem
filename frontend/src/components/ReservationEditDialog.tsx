import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import { formatDateTimeRange, toIsoDateTime, toLocalDateTimeInput } from '../utils/dateTime';
import {
  formatSlotDuration,
  getMinEndDateTimeLocal,
  getMinStartDateTimeLocal,
  getSlotDurationMinutes,
  isLocalDateTimeBefore,
  isValidSlotRange,
} from '../utils/slotTime';
import { SlotDateTimeField } from './SlotDateTimeField';

interface ReservationEditDialogProps {
  open: boolean;
  reservation: Reservation;
  onClose: () => void;
  onSuccess: (updated: Reservation) => void;
}

export function ReservationEditDialog({
  open,
  reservation,
  onClose,
  onSuccess,
}: ReservationEditDialogProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minStartTime = getMinStartDateTimeLocal();
  const minEndTime = startTime ? getMinEndDateTimeLocal(startTime) : '';

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (endTime && value && isLocalDateTimeBefore(endTime, getMinEndDateTimeLocal(value))) {
      setEndTime('');
    }
  };

  useEffect(() => {
    if (open) {
      setStartTime(toLocalDateTimeInput(reservation.startTime));
      setEndTime(toLocalDateTimeInput(reservation.endTime));
      setNotes(reservation.notes ?? '');
      setError(null);
      setAvailabilityMessage(null);
    }
  }, [open, reservation]);

  useEffect(() => {
    if (!open || !startTime || !endTime) {
      setAvailabilityMessage(null);
      return;
    }

    if (!isValidSlotRange(startTime, endTime)) {
      setAvailabilityMessage('Choose times on the hour or half-hour.');
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const startIso = toIsoDateTime(startTime);
          const endIso = toIsoDateTime(endTime);
          const result = await resourceApi.checkAvailability(
            reservation.resourceId,
            startIso,
            endIso,
            reservation.id,
          );
          setAvailabilityMessage(
            result.available ? 'This time slot is available.' : 'This time slot is already booked.',
          );
        } catch {
          setAvailabilityMessage(null);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [open, startTime, endTime, reservation.resourceId, reservation.id]);

  const handleSubmit = async () => {
    setError(null);

    if (!startTime || !endTime) {
      setError('Start and end times are required.');
      return;
    }

    if (!isValidSlotRange(startTime, endTime)) {
      setError(
        'Reservations must start on the hour or half-hour and last a multiple of 30 minutes.',
      );
      return;
    }

    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to update a reservation.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await reservationApi.updateReservation(
        reservation.id,
        {
          startTime: toIsoDateTime(startTime),
          endTime: toIsoDateTime(endTime),
          notes: notes.trim() === '' ? null : notes.trim(),
        },
        tokens.accessToken,
      );
      onSuccess(updated);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to update reservation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit reservation</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {reservation.resource.name} · {formatDateTimeRange(reservation.startTime, reservation.endTime)}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {availabilityMessage && (
            <Alert severity={availabilityMessage.includes('available') && !availabilityMessage.includes('already') ? 'success' : 'warning'}>
              {availabilityMessage}
            </Alert>
          )}
          <SlotDateTimeField
            label="Start time"
            value={startTime}
            onChange={handleStartTimeChange}
            min={minStartTime}
          />
          <SlotDateTimeField
            label="End time"
            value={endTime}
            onChange={setEndTime}
            min={minEndTime}
            disabled={!startTime}
            helperText={
              startTime
                ? 'Must be after start time, on the hour or half-hour'
                : 'Select a start time first'
            }
          />
          {startTime && endTime && isValidSlotRange(startTime, endTime) && (
            <Typography variant="body2" color="text.secondary">
              {formatDateTimeRange(toIsoDateTime(startTime), toIsoDateTime(endTime))}
              {' · '}
              {formatSlotDuration(getSlotDurationMinutes(startTime, endTime))}
            </Typography>
          )}
          <TextField
            label="Notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
