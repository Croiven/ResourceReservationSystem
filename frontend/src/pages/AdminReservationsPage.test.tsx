import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AdminReservationsPage } from './AdminReservationsPage';

vi.mock('../services/adminReservationApi', () => ({
  listAllReservations: vi.fn(),
}));

vi.mock('../services/reservationApi', () => ({
  cancelReservation: vi.fn(),
  updateReservation: vi.fn(),
}));

vi.mock('../services/userApi', () => ({
  listUsers: vi.fn(),
}));

vi.mock('../services/resourceApi', () => ({
  listResources: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

import * as adminReservationApi from '../services/adminReservationApi';
import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import * as userApi from '../services/userApi';

const adminReservationRow = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: 'CONFIRMED' as const,
  notes: null,
  createdAt: '',
  updatedAt: '',
  user: { id: 'user-1', firstName: 'Regular', lastName: 'User', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Conference Room A', type: 'ROOM' as const },
};

describe('AdminReservationsPage', () => {
  it('renders all reservations list', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([]);
    vi.mocked(resourceApi.listResources).mockResolvedValue([]);
    vi.mocked(adminReservationApi.listAllReservations).mockResolvedValue([adminReservationRow]);

    renderWithProviders(<AdminReservationsPage />);

    expect(await screen.findByText('All reservations')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('opens edit dialog from admin row action', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([]);
    vi.mocked(resourceApi.listResources).mockResolvedValue([]);
    vi.mocked(adminReservationApi.listAllReservations).mockResolvedValue([adminReservationRow]);

    renderWithProviders(<AdminReservationsPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByRole('heading', { name: /edit reservation/i })).toBeInTheDocument();
  });

  it('cancels reservation from admin row action', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([]);
    vi.mocked(resourceApi.listResources).mockResolvedValue([]);
    vi.mocked(adminReservationApi.listAllReservations).mockResolvedValue([adminReservationRow]);
    vi.mocked(reservationApi.cancelReservation).mockResolvedValue({
      ...adminReservationRow,
      status: 'CANCELLED',
    });

    renderWithProviders(<AdminReservationsPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^cancel reservation$/i }));

    await waitFor(() => {
      expect(reservationApi.cancelReservation).toHaveBeenCalledWith('res-1', 'token-123');
    });
  });
});
