import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHealthStatus } from './api';

describe('fetchHealthStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns health payload when ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      }),
    );

    await expect(fetchHealthStatus()).resolves.toEqual({ status: 'ok' });
  });

  it('throws when health check fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(fetchHealthStatus()).rejects.toThrow('Health check failed with status 503');
  });
});
