import { afterEach, describe, expect, it, vi } from 'vitest';
import { deactivateUser, getUser, listUsers, updateUser } from './userApi';

describe('userApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockOk = (data: unknown) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data }),
      }),
    );
  };

  it('lists users with auth', async () => {
    mockOk([{ id: '1' }]);
    await expect(listUsers('token')).resolves.toEqual([{ id: '1' }]);
  });

  it('throws when token missing', async () => {
    await expect(listUsers('')).rejects.toThrow('Not authenticated');
  });

  it('gets and updates a user', async () => {
    mockOk({ id: '1', firstName: 'Updated' });
    await expect(getUser('1', 'token')).resolves.toEqual({ id: '1', firstName: 'Updated' });
    await expect(updateUser('1', { firstName: 'Updated' }, 'token')).resolves.toEqual({
      id: '1',
      firstName: 'Updated',
    });
  });

  it('deactivates a user', async () => {
    mockOk({ id: '1', isActive: false });
    await expect(deactivateUser('1', 'token')).resolves.toEqual({ id: '1', isActive: false });
  });
});
