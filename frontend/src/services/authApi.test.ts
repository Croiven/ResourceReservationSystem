import { afterEach, describe, expect, it, vi } from 'vitest';
import { login, register } from './authApi';

describe('authApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls login endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { accessToken: 'a', refreshToken: 'r', expiresIn: 900 },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await login({ email: 'user@example.com', password: 'password123' });

    expect(result.accessToken).toBe('a');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls register endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: '1',
            email: 'user@example.com',
            firstName: 'User',
            lastName: 'Test',
            role: 'USER',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'User',
      lastName: 'Test',
    });

    expect(result.email).toBe('user@example.com');
  });
});
