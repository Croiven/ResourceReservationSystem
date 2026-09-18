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
}));

import * as resourceApi from '../services/resourceApi';
import { ApiError } from '../types/api';

describe('ResourceDetailPage', () => {
  it('displays resource details', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue({
      id: 'resource-1',
      name: 'Conference Room A',
      description: 'Large meeting room',
      type: 'ROOM',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    renderDetailPage('/resources/resource-1');

    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
    expect(screen.getByText('Large meeting room')).toBeInTheDocument();
    expect(screen.getByText('Room')).toBeInTheDocument();
  });

  it('shows not found message for missing resource', async () => {
    vi.mocked(resourceApi.getResource).mockRejectedValue(new ApiError('Resource not found', 404));

    renderDetailPage('/resources/missing');

    expect(await screen.findByText(/resource not found/i)).toBeInTheDocument();
  });
});
