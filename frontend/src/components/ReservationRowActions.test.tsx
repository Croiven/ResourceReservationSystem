import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Reservation } from '../types/reservation';
import { ReservationRowActions } from './ReservationRowActions';

const reservation: Reservation = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: 'CONFIRMED',
  notes: null,
  createdAt: '',
  updatedAt: '',
  user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' },
};

describe('ReservationRowActions', () => {
  it('invokes edit and cancel handlers', () => {
    const onEdit = vi.fn();
    const onCancel = vi.fn();

    render(
      <ReservationRowActions reservation={reservation} onEdit={onEdit} onCancel={onCancel} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(onEdit).toHaveBeenCalledWith(reservation);
    expect(onCancel).toHaveBeenCalledWith(reservation);
  });

  it('disables edit for cancelled reservations', () => {
    render(
      <ReservationRowActions
        reservation={{ ...reservation, status: 'CANCELLED' }}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /^edit$/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeDisabled();
  });
});
