import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { renderWithProviders } from '../test/renderWithProviders';
import { ProfilePage } from './ProfilePage';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

function mockAuthUser(changePassword = vi.fn()) {
  vi.mocked(useAuth).mockReturnValue({
    user: {
      id: '1',
      email: 'user@example.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    changePassword,
    refreshUser: vi.fn(),
  });
}

describe('ProfilePage', () => {
  it('displays user account information', () => {
    mockAuthUser();

    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Account details')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Change password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('shows validation errors for weak or mismatched passwords', async () => {
    mockAuthUser();

    renderWithProviders(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('submits password change successfully', async () => {
    const changePassword = vi.fn().mockResolvedValue(undefined);
    mockAuthUser(changePassword);

    renderWithProviders(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });
    });

    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument();
  });

  it('shows API error when change password fails', async () => {
    const changePassword = vi
      .fn()
      .mockRejectedValue(new ApiError('Current password is incorrect', 401));
    mockAuthUser(changePassword);

    renderWithProviders(<ProfilePage />);

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText(/^new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Current password is incorrect')).toBeInTheDocument();
  });
});
