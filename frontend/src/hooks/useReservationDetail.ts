import { useEffect, useState } from 'react';
import * as reservationApi from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import { isReservationCancellable, isReservationEditable } from '../utils/reservationRules';

export function useReservationDetail(reservationId: string | undefined) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!reservationId) return;

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
        const data = await reservationApi.getReservation(reservationId, tokens.accessToken);
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
  }, [reservationId]);

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

  return {
    reservation,
    setReservation,
    isLoading,
    error,
    editOpen,
    setEditOpen,
    cancelOpen,
    setCancelOpen,
    isCancelling,
    handleCancel,
    canEdit,
    canCancel,
  };
}
