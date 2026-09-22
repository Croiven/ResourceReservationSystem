import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { AdminReservationDetailPage } from './AdminReservationDetailPage';

function renderAdminReservationDetail(route: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/reservations/:id" element={<AdminReservationDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

vi.mock('../services/reservationApi', () => ({
  getReservation: vi.fn(),
  cancelReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

import * as reservationApi from '../services/reservationApi';

describe('AdminReservationDetailPage', () => {
  it('renders reservation detail with booked by info', async () => {
    vi.mocked(reservationApi.getReservation).mockResolvedValue({
      id: 'res-1',
      userId: 'user-1',
      resourceId: 'resource-1',
      startTime: '2030-01-01T10:00:00.000Z',
      endTime: '2030-01-01T11:00:00.000Z',
      status: 'CONFIRMED',
      notes: 'Team meeting',
      createdAt: '',
      updatedAt: '',
      user: { id: 'user-1', firstName: 'Regular', lastName: 'User', email: 'user@example.com' },
      resource: { id: 'resource-1', name: 'Conference Room A', type: 'ROOM' },
    });

    renderAdminReservationDetail('/admin/reservations/res-1');

    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText(/booked by/i)).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to all reservations/i })).toBeInTheDocument();
  });
});
