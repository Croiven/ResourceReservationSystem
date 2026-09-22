import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { ReservationDetailPage } from './ReservationDetailPage';

function renderReservationDetail(route: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route path="/reservations/:id" element={<ReservationDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

vi.mock('../services/reservationApi', () => ({
  getReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

import * as reservationApi from '../services/reservationApi';

describe('ReservationDetailPage', () => {
  it('displays reservation details', async () => {
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
      user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
      resource: { id: 'resource-1', name: 'Conference Room A', type: 'ROOM' },
    });

    renderReservationDetail('/reservations/res-1');

    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Team meeting')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
