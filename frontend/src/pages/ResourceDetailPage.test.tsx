import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { theme } from '../theme/theme';
import { ResourceDetailPage } from './ResourceDetailPage';

function renderDetailPage(route: string) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

vi.mock('../services/resourceApi', () => ({
  getResource: vi.fn(),
  getResourceBookings: vi.fn(),
  checkAvailability: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import * as resourceApi from '../services/resourceApi';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';

describe('ResourceDetailPage', () => {
  it('displays resource details and availability section', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });
    vi.mocked(resourceApi.getResource).mockResolvedValue({
      id: 'resource-1',
      name: 'Conference Room A',
      description: 'Large meeting room',
      type: 'ROOM',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);

    renderDetailPage('/resources/resource-1');

    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Availability calendar')).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('shows not found message for missing resource', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });
    vi.mocked(resourceApi.getResource).mockRejectedValue(new ApiError('Resource not found', 404));

    renderDetailPage('/resources/missing');

    expect(await screen.findByText(/resource not found/i)).toBeInTheDocument();
  });
});
