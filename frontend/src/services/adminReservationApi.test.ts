import { afterEach, describe, expect, it, vi } from 'vitest';
import { listAllReservations } from './adminReservationApi';

describe('adminReservationApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls admin list reservations with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listAllReservations(undefined, 'token-123');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token-123');
    expect(mockFetch).toHaveBeenCalledWith('/api/admin/reservations', expect.any(Object));
  });

  it('builds query string for admin list filters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listAllReservations(
      {
        userId: 'user-1',
        resourceId: 'resource-1',
        status: 'CONFIRMED',
      },
      'token-123',
    );

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/reservations?userId=user-1&resourceId=resource-1&status=CONFIRMED',
      expect.any(Object),
    );
  });
});
