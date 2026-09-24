import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAuthTokens } from './sessionRefresh';
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
});
