import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reservation } from '../types/reservation';
import { ApiError } from '../types/api';
import { theme } from '../theme/theme';
import { ReservationEditDialog } from './ReservationEditDialog';

vi.mock('../services/reservationApi', () => ({
  updateReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(() => ({ accessToken: 'token', refreshToken: 'refresh' })),
}));

vi.mock('../utils/reservationEditAvailability', () => ({
  checkEditAvailability: vi.fn(async () => ({
    available: true,
    message: 'This time slot is available.',
  })),
}));

import * as reservationApi from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';

const reservation: Reservation = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-06-01T10:00:00.000Z',
  endTime: '2030-06-01T11:00:00.000Z',
  status: 'CONFIRMED',
  notes: 'Notes',
  createdAt: '',
  updatedAt: '',
  user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' },
};

describe('ReservationEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders editable reservation fields when open', () => {
    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={reservation}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Edit reservation')).toBeInTheDocument();
    expect(screen.getAllByLabelText(/start time/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/end time/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^notes$/i)).toHaveValue('Notes');
  });

  it('saves changes and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const updated: Reservation = { ...reservation, notes: 'Updated notes' };
    vi.mocked(reservationApi.updateReservation).mockResolvedValue(updated);

    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={reservation}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/^notes$/i), { target: { value: 'Updated notes' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(reservationApi.updateReservation).toHaveBeenCalled();
    });

    expect(onSuccess).toHaveBeenCalledWith(updated);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows API error when update fails', async () => {
    vi.mocked(reservationApi.updateReservation).mockRejectedValue(
      new ApiError('Conflict with another booking', 409),
    );

    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={reservation}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Conflict with another booking')).toBeInTheDocument();
  });

  it('shows error when not signed in', async () => {
    vi.mocked(getTokens).mockReturnValue(null);

    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={reservation}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/must be signed in/i)).toBeInTheDocument();
    expect(reservationApi.updateReservation).not.toHaveBeenCalled();
  });

  it('shows read-only state when reservation already started', () => {
    const started: Reservation = {
      ...reservation,
      startTime: '2020-06-01T10:00:00.000Z',
      endTime: '2020-06-01T11:00:00.000Z',
    };

    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={started}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText(/already started/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  it('shows error when end time is cleared', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ReservationEditDialog
          open
          reservation={reservation}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/end time date/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Start and end times are required.')).toBeInTheDocument();
    expect(reservationApi.updateReservation).not.toHaveBeenCalled();
  });
});
