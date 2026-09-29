import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
import type { ResourceBooking } from '../types/reservation';
import type { Resource } from '../types/resource';
import { ApiError } from '../types/api';
import { getWeekStart, weekRangeIso } from '../utils/calendar';
import { toIsoDateTime } from '../utils/dateTime';
import {
  getLocalSlotRangeFeedback,
  isValidSlotRange,
  slotAvailabilityFeedback,
} from '../utils/slotTime';

export function useResourceDetailPage(resourceId: string | undefined) {
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!resourceId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadResource = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await resourceApi.getResource(resourceId);
        if (!cancelled) {
          setResource(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setNotFound(true);
            setResource(null);
          } else if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Unable to load resource. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  useEffect(() => {
    if (!resourceId) return;

    let cancelled = false;
    const { from, to } = weekRangeIso(weekStart);

    const loadBookings = async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      setBookings([]);

      try {
        const data = await resourceApi.getResourceBookings(resourceId, from, to);
        if (!cancelled) {
          setBookings(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setBookingsError(err.message);
          } else {
            setBookingsError('Unable to load availability.');
          }
          setBookings([]);
        }
      } finally {
        if (!cancelled) {
          setBookingsLoading(false);
        }
      }
    };

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [resourceId, weekStart]);

  useEffect(() => {
    if (!resourceId || !startTime || !endTime) {
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
          const result = await resourceApi.checkAvailability(
            resourceId,
            toIsoDateTime(startTime),
            toIsoDateTime(endTime),
          );
          setAvailabilityMessage(slotAvailabilityFeedback(result.available).message);
        } catch {
          setAvailabilityMessage(null);
        }
      })();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [resourceId, startTime, endTime]);

  const submitBooking = async () => {
    setBookingError(null);

    if (!resourceId || !startTime || !endTime) {
      setBookingError('Start and end times are required.');
      return;
    }

    if (!isValidSlotRange(startTime, endTime)) {
      setBookingError(
        'Reservations must start on the hour or half-hour and last a multiple of 30 minutes.',
      );
      return;
    }

    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setBookingError('You must be signed in to book.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await reservationApi.createReservation(
        {
          resourceId,
          startTime: toIsoDateTime(startTime),
          endTime: toIsoDateTime(endTime),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
        tokens.accessToken,
      );
      void navigate(`/reservations/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setBookingError(err.message);
      } else {
        setBookingError('Unable to create reservation. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    resource,
    isLoading,
    notFound,
    error,
    weekStart,
    setWeekStart,
    bookings,
    bookingsLoading,
    bookingsError,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    notes,
    setNotes,
    bookingError,
    availabilityMessage,
    isSubmitting,
    submitBooking,
  };
}
