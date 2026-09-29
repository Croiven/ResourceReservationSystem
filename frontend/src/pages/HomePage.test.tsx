import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { HomePage } from './HomePage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

const authStub = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  changePassword: vi.fn(),
  refreshUser: vi.fn(),
};

describe('HomePage', () => {
  it('shows guest get started links when logged out', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authStub,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows account links for signed-in users', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authStub,
      user: {
        id: '1',
        email: 'user@example.com',
        firstName: 'Alex',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { name: /Welcome back, Alex/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My reservations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('shows admin section for administrators', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authStub,
      user: {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<HomePage />);

    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Manage resources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'All reservations' })).toBeInTheDocument();
  });
});
