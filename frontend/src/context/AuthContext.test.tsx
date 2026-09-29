import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUTH_SESSION_EXPIRED_EVENT } from '../services/sessionRefresh';
import { setTokens } from '../services/tokenStorage';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthContext';

const profile = {
  id: '1',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  role: 'USER' as const,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('login sets user and stores tokens', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: '1',
                email: 'user@example.com',
                firstName: 'Regular',
                lastName: 'User',
                role: 'USER',
                isActive: true,
                createdAt: '',
                updatedAt: '',
              },
            }),
        }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'user@example.com', password: 'password123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('user@example.com');
  });

  it('logout clears user state', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: { accessToken: 'access', refreshToken: 'refresh', expiresIn: 900 },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                id: '1',
                email: 'user@example.com',
                firstName: 'Regular',
                lastName: 'User',
                role: 'USER',
                isActive: true,
                createdAt: '',
                updatedAt: '',
              },
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: { message: 'Logged out' } }),
        }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: 'user@example.com', password: 'password123' });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('register completes without setting user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: profile }),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Regular',
        lastName: 'User',
      });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('changePassword clears session after success', async () => {
    setTokens({ accessToken: 'access', refreshToken: 'refresh' }, 900);

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: profile }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: { message: 'Password updated' } }),
        }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.email).toBe('user@example.com');
    });

    await act(async () => {
      await result.current.changePassword({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('clears user when session expired event fires', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: profile }),
      }),
    );

    setTokens({ accessToken: 'access', refreshToken: 'refresh' }, 900);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.email).toBe('user@example.com');
    });

    act(() => {
      window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
    });

    expect(result.current.user).toBeNull();
  });

  it('clears user when stored session cannot be refreshed', async () => {
    setTokens({ accessToken: 'access', refreshToken: 'refresh' }, 900);

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('schedules proactive token refresh while user is signed in', async () => {
    vi.useFakeTimers();
    try {
      setTokens({ accessToken: 'access', refreshToken: 'refresh' }, 65);

      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: profile }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              data: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 900 },
            }),
        });

      vi.stubGlobal('fetch', fetchMock);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.user?.email).toBe('user@example.com');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000);
        await Promise.resolve();
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/refresh',
        expect.objectContaining({ method: 'POST' }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
