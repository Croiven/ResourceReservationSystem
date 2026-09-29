import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import type { User } from '../types/user';
import { theme } from '../theme/theme';
import { UserEditDialog } from './UserEditDialog';

vi.mock('../services/userApi', () => ({
  updateUser: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(() => ({ accessToken: 'token', refreshToken: 'refresh' })),
}));

import * as userApi from '../services/userApi';

const user: User = {
  id: 'user-2',
  email: 'other@example.com',
  firstName: 'Other',
  lastName: 'User',
  role: 'USER',
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('UserEditDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user fields and validates required names', async () => {
    render(
      <ThemeProvider theme={theme}>
        <UserEditDialog open user={user} isSelf={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Edit user')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Other')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('First and last name are required.')).toBeInTheDocument();
  });

  it('saves user updates', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const updated = { ...user, firstName: 'Updated' };
    vi.mocked(userApi.updateUser).mockResolvedValue(updated);

    render(
      <ThemeProvider theme={theme}>
        <UserEditDialog open user={user} isSelf={false} onClose={onClose} onSuccess={onSuccess} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(userApi.updateUser).toHaveBeenCalled();
    });

    expect(onSuccess).toHaveBeenCalledWith(updated);
    expect(onClose).toHaveBeenCalled();
  });

  it('requires confirmation before promoting to admin', async () => {
    vi.mocked(userApi.updateUser).mockResolvedValue({ ...user, role: 'ADMIN' });

    render(
      <ThemeProvider theme={theme}>
        <UserEditDialog open user={user} isSelf={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    fireEvent.mouseDown(screen.getByLabelText(/^role$/i));
    fireEvent.click(screen.getByRole('option', { name: /admin/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByRole('heading', { name: /promote to admin/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /promote to admin/i }));

    await waitFor(() => {
      expect(userApi.updateUser).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({ role: 'ADMIN' }),
        'token',
      );
    });
  });

  it('shows API error when update fails', async () => {
    vi.mocked(userApi.updateUser).mockRejectedValue(new ApiError('Cannot demote last admin', 400));

    render(
      <ThemeProvider theme={theme}>
        <UserEditDialog open user={user} isSelf={false} onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Cannot demote last admin')).toBeInTheDocument();
  });
});
