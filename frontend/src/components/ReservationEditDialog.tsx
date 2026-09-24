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
import { checkEditAvailability } from '../utils/reservationEditAvailability';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import {
  formatDateTime,
  formatDateTimeRange,
  toIsoDateTime,
  toLocalDateTimeInput,
} from '../utils/dateTime';
import { isReservationEditable } from '../utils/reservationRules';
import {
  formatSlotDuration,
  getEditMinStartDateTimeLocal,
  getLocalSlotRangeFeedback,
  getMinEndDateTimeLocal,
  getSlotDurationMinutes,
  isLocalDateTimeBefore,
  isValidLocalSlotRange,
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

  const editable = isReservationEditable(reservation);
  const minStartTime = getEditMinStartDateTimeLocal(reservation.startTime);
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
    if (!open || !editable || !startTime || !endTime) {
      setAvailabilityMessage(null);
      return;
    }

    const localFeedback = getLocalSlotRangeFeedback(startTime, endTime);
    if (localFeedback) {
      setAvailabilityMessage(localFeedback.message);
      return;
    }

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const feedback = await checkEditAvailability(reservation, startTime, endTime);
          setAvailabilityMessage(feedback.message);
        } catch {
          setAvailabilityMessage(null);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [open, editable, startTime, endTime, reservation]);

  const handleSubmit = async () => {
    setError(null);

    if (!editable) {
      setError('This reservation can no longer be edited because it has already started.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start and end times are required.');
      return;
    }

    const localFeedback = getLocalSlotRangeFeedback(startTime, endTime);
    if (localFeedback) {
      setError(localFeedback.message);
      return;
    }

    if (!isValidLocalSlotRange(startTime, endTime)) {
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
          {!editable && (
            <Alert severity="info">
              This reservation has already started and can no longer be rescheduled.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {availabilityMessage && (
            <Alert
              severity={
                availabilityMessage === 'This time slot is available.' ? 'success' : 'warning'
              }
            >
              {availabilityMessage}
            </Alert>
          )}
          {editable ? (
            <>
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
            </>
          ) : (
            <>
              <TextField
                label="Start time"
                value={formatDateTime(reservation.startTime)}
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End time"
                value={formatDateTime(reservation.endTime)}
                fullWidth
                disabled
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </>
          )}
          {editable && startTime && endTime && isValidLocalSlotRange(startTime, endTime) && (
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
            disabled={!editable}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={isSubmitting || !editable}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
