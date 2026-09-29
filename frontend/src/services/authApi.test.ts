import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  changePassword,
  getMe,
  login,
  logout,
  refresh,
  register,
} from './authApi';

vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('./sessionRefresh', () => ({
  refreshAuthTokens: vi.fn(),
}));

import { apiRequest } from './apiClient';
import { refreshAuthTokens } from './sessionRefresh';

describe('authApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('registers a user', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ id: '1' });
    await expect(
      register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test',
      }),
    ).resolves.toEqual({ id: '1' });
  });

  it('logs in and returns tokens', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 900 });
    await expect(login({ email: 'user@example.com', password: 'password123' })).resolves.toEqual({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    });
  });

  it('logs out with refresh token', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ message: 'ok' });
    await logout('refresh');
    expect(apiRequest).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({ method: 'POST' }));
  });

  it('refreshes tokens via session helper', async () => {
    vi.mocked(refreshAuthTokens).mockResolvedValue({
      accessToken: 'new',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
    await expect(refresh('refresh')).resolves.toEqual({
      accessToken: 'new',
      refreshToken: 'refresh',
      expiresIn: 900,
    });
  });

  it('loads current user and changes password', async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: '1' }).mockResolvedValueOnce({ message: 'changed' });

    await expect(getMe('token')).resolves.toEqual({ id: '1' });
    await expect(
      changePassword('token', { currentPassword: 'old', newPassword: 'newpassword' }),
    ).resolves.toEqual({ message: 'changed' });
  });
});
