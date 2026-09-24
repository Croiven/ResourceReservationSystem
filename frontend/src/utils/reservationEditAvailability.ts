import * as resourceApi from '../services/resourceApi';
import type { AvailabilityUnavailableReason, Reservation } from '../types/reservation';
import { toIsoDateTime } from './dateTime';
import { type SlotRangeFeedback, slotAvailabilityFeedback } from './slotTime';

export function isSameInstant(leftIso: string, rightIso: string): boolean {
  return new Date(leftIso).getTime() === new Date(rightIso).getTime();
}

/** True when the proposed range stays inside the current booking (only overlaps itself). */
export function isWithinOriginalBookingWindow(
  reservation: Pick<Reservation, 'startTime' | 'endTime'>,
  startIso: string,
  endIso: string,
): boolean {
  const origStart = new Date(reservation.startTime).getTime();
  const origEnd = new Date(reservation.endTime).getTime();
  const newStart = new Date(startIso).getTime();
  const newEnd = new Date(endIso).getTime();

  return newStart >= origStart && newEnd <= origEnd;
}

function feedbackForUnavailableReason(reason: AvailabilityUnavailableReason): SlotRangeFeedback {
  switch (reason) {
    case 'RESOURCE_INACTIVE':
      return {
        severity: 'warning',
        message: 'This resource is no longer active and cannot be booked.',
      };
    case 'START_IN_PAST':
      return {
        severity: 'warning',
        message: 'Start time must be in the future.',
      };
    case 'OVERLAP':
      return slotAvailabilityFeedback(false);
    default:
      return slotAvailabilityFeedback(false);
  }
}

export async function checkEditAvailability(
  reservation: Reservation,
  startLocal: string,
  endLocal: string,
): Promise<SlotRangeFeedback> {
  const startIso = toIsoDateTime(startLocal);
  const endIso = toIsoDateTime(endLocal);

  if (
    isSameInstant(startIso, reservation.startTime) &&
    isSameInstant(endIso, reservation.endTime)
  ) {
    return slotAvailabilityFeedback(true);
  }

  const result = await resourceApi.checkAvailability(
    reservation.resourceId,
    startIso,
    endIso,
    reservation.id,
  );

  if (result.available) {
    return slotAvailabilityFeedback(true);
  }

  if (
    result.reason === 'OVERLAP' &&
    isWithinOriginalBookingWindow(reservation, startIso, endIso)
  ) {
    return slotAvailabilityFeedback(true);
  }

  if (result.reason) {
    return feedbackForUnavailableReason(result.reason);
  }

  return slotAvailabilityFeedback(false);
}
