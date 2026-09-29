import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { apiRequest } from './apiClient';

vi.mock('./tokenStorage', () => ({
  getTokens: vi.fn(),
}));

vi.mock('./sessionRefresh', () => ({
  refreshAuthTokens: vi.fn(),
  notifySessionExpired: vi.fn(),
}));

import { getTokens } from './tokenStorage';
import { notifySessionExpired, refreshAuthTokens } from './sessionRefresh';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed data on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: '1' } }),
      }),
    );

    await expect(apiRequest<{ id: string }>('/health')).resolves.toEqual({ id: '1' });
  });

  it('throws ApiError with message from error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { message: 'Bad input' } }),
      }),
    );

    await expect(apiRequest('/resources')).rejects.toEqual(new ApiError('Bad input', 400));
  });

  it('retries once after refreshing tokens on 401', async () => {
    vi.mocked(getTokens).mockReturnValue({
      accessToken: 'old',
      refreshToken: 'refresh',
      accessTokenExpiresAt: Date.now() + 60_000,
    });
    vi.mocked(refreshAuthTokens).mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'refresh',
      expiresIn: 900,
    });

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ok: true } }),
      });
    vi.stubGlobal('fetch', mockFetch);

    await expect(apiRequest('/reservations', { accessToken: 'old' })).resolves.toEqual({ ok: true });
    expect(refreshAuthTokens).toHaveBeenCalledWith('refresh');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('notifies session expired when refresh fails', async () => {
    vi.mocked(getTokens).mockReturnValue({
      accessToken: 'old',
      refreshToken: 'refresh',
      accessTokenExpiresAt: Date.now() + 60_000,
    });
    vi.mocked(refreshAuthTokens).mockRejectedValue(new Error('refresh failed'));

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: () => Promise.resolve({}) }),
    );

    await expect(apiRequest('/reservations', { accessToken: 'old' })).rejects.toEqual(
      new ApiError('Session expired', 401),
    );
    expect(notifySessionExpired).toHaveBeenCalled();
  });
});
