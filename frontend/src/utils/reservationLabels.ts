import type { ReservationStatus } from '../types/reservation';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

export function getReservationStatusLabel(status: ReservationStatus): string {
  return STATUS_LABELS[status];
}

export type StatusFilter = ReservationStatus | 'all';

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function getStatusChipColor(
  status: ReservationStatus,
): 'success' | 'warning' | 'default' {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'default';
}
