import { useState } from 'react';
import * as reservationApi from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';

export function useReservationCancelFlow(
  onSuccess: () => Promise<void>,
  setPageError: (message: string | null) => void,
) {
  const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelConfirm = async () => {
    if (!cancelReservation) return;

    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    setIsCancelling(true);
    try {
      await reservationApi.cancelReservation(cancelReservation.id, tokens.accessToken);
      setCancelReservation(null);
      await onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setPageError(err.message);
      } else {
        setPageError('Unable to cancel reservation. Please try again.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    cancelReservation,
    setCancelReservation,
    isCancelling,
    handleCancelConfirm,
  };
}
