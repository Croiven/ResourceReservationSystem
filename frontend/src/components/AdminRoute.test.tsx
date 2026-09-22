import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AdminRoute } from './AdminRoute';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

describe('AdminRoute', () => {
  it('renders children for admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
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
    });

    renderWithProviders(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>,
    );

    expect(screen.getByText('Admin content')).toBeInTheDocument();
  });

  it('redirects non-admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '1',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
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
    });

    renderWithProviders(
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>,
      { route: '/admin/resources' },
    );

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users', () => {
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
      <AdminRoute>
        <div>Admin content</div>
      </AdminRoute>,
      { route: '/admin/resources' },
    );

    expect(screen.queryByText('Admin content')).not.toBeInTheDocument();
  });
});
