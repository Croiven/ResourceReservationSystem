import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AdminUsersPage } from './AdminUsersPage';

vi.mock('../services/userApi', () => ({
  listUsers: vi.fn(),
  updateUser: vi.fn(),
  deactivateUser: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    refreshUser: vi.fn(),
  })),
}));

import * as userApi from '../services/userApi';

describe('AdminUsersPage', () => {
  it('renders users list and disables self deactivation', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([
      {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    renderWithProviders(<AdminUsersPage />);

    expect(await screen.findByRole('heading', { name: /manage users/i })).toBeInTheDocument();
    expect(screen.getByText('Regular User')).toBeInTheDocument();

    const deactivateButtons = screen.getAllByRole('button', { name: /deactivate/i });
    expect(deactivateButtons[0]).toBeDisabled();
    expect(deactivateButtons[1]).not.toBeDisabled();
  });

  it('opens edit dialog for another user', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([
      {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    renderWithProviders(<AdminUsersPage />);

    await screen.findByText('Regular User');

    const editButtons = screen.getAllByRole('button', { name: /^edit$/i });
    fireEvent.click(editButtons[1]!);

    expect(screen.getByRole('heading', { name: /edit user/i })).toBeInTheDocument();
  });

  it('deactivates user after confirmation', async () => {
    vi.mocked(userApi.listUsers).mockResolvedValue([
      {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);
    vi.mocked(userApi.deactivateUser).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      isActive: false,
      createdAt: '',
      updatedAt: '',
    });

    renderWithProviders(<AdminUsersPage />);

    await screen.findByText('Regular User');

    const deactivateButtons = screen.getAllByRole('button', { name: /deactivate/i });
    fireEvent.click(deactivateButtons[1]!);

    expect(screen.getByRole('heading', { name: /deactivate user/i })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole('button', { name: /^deactivate$/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    await waitFor(() => {
      expect(userApi.deactivateUser).toHaveBeenCalledWith('user-1', 'token-123');
    });
  });
});
