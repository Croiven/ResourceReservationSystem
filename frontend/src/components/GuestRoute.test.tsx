import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { GuestRoute } from './GuestRoute';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

describe('GuestRoute', () => {
  it('renders children when logged out', () => {
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
      <GuestRoute>
        <div>Guest content</div>
      </GuestRoute>,
    );

    expect(screen.getByText('Guest content')).toBeInTheDocument();
  });

  it('redirects authenticated users away from guest routes', () => {
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
      <GuestRoute>
        <div>Guest content</div>
      </GuestRoute>,
      { route: '/login' },
    );

    expect(screen.queryByText('Guest content')).not.toBeInTheDocument();
  });

  it('shows loading indicator while auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(
      <GuestRoute>
        <div>Guest content</div>
      </GuestRoute>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Guest content')).not.toBeInTheDocument();
  });
});
