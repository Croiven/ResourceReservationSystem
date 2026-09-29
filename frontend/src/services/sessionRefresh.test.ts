import { afterEach, describe, expect, it, vi } from 'vitest';
import { notifySessionExpired, refreshAuthTokens } from './sessionRefresh';
import { getTokens, setTokens } from './tokenStorage';

describe('refreshAuthTokens', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deduplicates concurrent refresh requests', async () => {
    setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' });

    let resolveFetch: (value: Response) => void = () => undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });

    const mockFetch = vi.fn().mockReturnValue(fetchPromise);
    vi.stubGlobal('fetch', mockFetch);

    const first = refreshAuthTokens('old-refresh');
    const second = refreshAuthTokens('old-refresh');

    resolveFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 900 },
        }),
    } as Response);

    const [a, b] = await Promise.all([first, second]);

    expect(a.accessToken).toBe('new-access');
    expect(b.accessToken).toBe('new-access');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getTokens()?.accessToken).toBe('new-access');
  });

  it('throws when no refresh token is available', async () => {
    await expect(refreshAuthTokens()).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws when refresh endpoint fails', async () => {
    setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      }),
    );

    await expect(refreshAuthTokens('old-refresh')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('notifySessionExpired clears tokens and dispatches event', () => {
    setTokens({ accessToken: 'access', refreshToken: 'refresh' });
    const handler = vi.fn();
    window.addEventListener('auth:session-expired', handler);

    notifySessionExpired();

    expect(getTokens()).toBeNull();
    expect(handler).toHaveBeenCalled();

    window.removeEventListener('auth:session-expired', handler);
  });
});
