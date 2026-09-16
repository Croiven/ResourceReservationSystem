import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects when unauthenticated', () => {
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

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      { route: '/profile' },
    );

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});
