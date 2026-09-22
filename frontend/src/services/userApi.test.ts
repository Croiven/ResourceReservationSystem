import { afterEach, describe, expect, it, vi } from 'vitest';
import { listUsers, updateUser } from './userApi';

describe('userApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls list users with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listUsers('token-123');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token-123');
    expect(mockFetch).toHaveBeenCalledWith('/api/users', expect.any(Object));
  });

  it('calls update user endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'user-1',
            email: 'user@example.com',
            firstName: 'Updated',
            lastName: 'User',
            role: 'USER',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await updateUser('user-1', { firstName: 'Updated' }, 'token-123');

    expect(result.firstName).toBe('Updated');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users/user-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
