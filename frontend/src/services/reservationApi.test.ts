import { afterEach, describe, expect, it, vi } from 'vitest';
import { createReservation, listReservations } from './reservationApi';

describe('reservationApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls list reservations with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listReservations(undefined, 'token-123');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token-123');
  });

  it('calls create reservation endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'res-1',
            userId: 'user-1',
            resourceId: 'resource-1',
            startTime: '2030-01-01T10:00:00.000Z',
            endTime: '2030-01-01T11:00:00.000Z',
            status: 'CONFIRMED',
            notes: null,
            createdAt: '',
            updatedAt: '',
            user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
            resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' },
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await createReservation(
      {
        resourceId: 'resource-1',
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      },
      'token-123',
    );

    expect(result.id).toBe('res-1');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/reservations',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
