import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { ReservationsPage } from './ReservationsPage';

vi.mock('../services/reservationApi', () => ({
  listReservations: vi.fn(),
  cancelReservation: vi.fn(),
  updateReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

import * as reservationApi from '../services/reservationApi';

const reservationRow = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: 'CONFIRMED' as const,
  notes: null,
  createdAt: '',
  updatedAt: '',
  user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Conference Room A', type: 'ROOM' as const },
};

describe('ReservationsPage', () => {
  it('renders my reservations list', async () => {
    vi.mocked(reservationApi.listReservations).mockResolvedValue([reservationRow]);

    renderWithProviders(<ReservationsPage />);

    expect(await screen.findByText('My Reservations')).toBeInTheDocument();
    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
  });

  it('shows empty state when user has no reservations', async () => {
    vi.mocked(reservationApi.listReservations).mockResolvedValue([]);

    renderWithProviders(<ReservationsPage />);

    expect(await screen.findByText(/you have no reservations/i)).toBeInTheDocument();
  });

  it('opens edit dialog from row action', async () => {
    vi.mocked(reservationApi.listReservations).mockResolvedValue([reservationRow]);

    renderWithProviders(<ReservationsPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByRole('heading', { name: /edit reservation/i })).toBeInTheDocument();
  });

  it('opens cancel dialog from row action', async () => {
    vi.mocked(reservationApi.listReservations).mockResolvedValue([reservationRow]);
    vi.mocked(reservationApi.cancelReservation).mockResolvedValue({
      ...reservationRow,
      status: 'CANCELLED',
    });

    renderWithProviders(<ReservationsPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getByRole('heading', { name: /cancel reservation/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^cancel reservation$/i }));

    await waitFor(() => {
      expect(reservationApi.cancelReservation).toHaveBeenCalledWith('res-1', 'token-123');
    });
  });
});
