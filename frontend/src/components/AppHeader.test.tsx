import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AppHeader } from './AppHeader';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const useMediaQueryMock = vi.fn(() => false);

vi.mock('@mui/material/useMediaQuery', () => ({
  default: (query: unknown) => useMediaQueryMock(query),
}));

import { useAuth } from '../hooks/useAuth';

describe('AppHeader', () => {
  beforeEach(() => {
    useMediaQueryMock.mockReturnValue(false);
  });

  it('renders login and register when logged out', () => {
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

    renderWithProviders(<AppHeader />);

    expect(screen.getByText('Resource Reservation System')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('renders profile and logout when logged in', () => {
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

    renderWithProviders(<AppHeader />);

    fireEvent.click(screen.getByRole('button', { name: /regular/i }));

    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
  });

  it('renders admin menu for admin users', async () => {
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

    renderWithProviders(<AppHeader />);

    fireEvent.click(screen.getByRole('button', { name: /open admin menu/i }));

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /manage resources/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /manage users/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /all reservations/i })).toBeInTheDocument();
  });

  it('renders desktop navigation links for signed-in users', () => {
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

    renderWithProviders(<AppHeader />);

    expect(screen.getByRole('link', { name: /my reservations/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resources/i })).toBeInTheDocument();
  });

  it('calls logout from account menu', () => {
    const logout = vi.fn().mockResolvedValue(undefined);
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
      logout,
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<AppHeader />);

    fireEvent.click(screen.getByRole('button', { name: /regular/i }));
    fireEvent.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /logout/i }));

    expect(logout).toHaveBeenCalled();
  });

  it('opens mobile drawer and shows navigation links', () => {
    useMediaQueryMock.mockReturnValue(true);

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

    renderWithProviders(<AppHeader />);

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
  });
});
