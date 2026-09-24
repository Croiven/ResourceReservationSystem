import type { ReservationStatus } from '../types/reservation';

export function hasReservationStarted(
  reservation: { startTime: string },
  now = new Date(),
): boolean {
  return new Date(reservation.startTime) <= now;
}

export function isReservationEditable(reservation: {
  status: ReservationStatus;
  startTime: string;
}): boolean {
  return reservation.status !== 'CANCELLED' && !hasReservationStarted(reservation);
}

export function isReservationCancellable(reservation: { status: ReservationStatus }): boolean {
  return reservation.status !== 'CANCELLED';
}
