import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelReservation,
  createReservation,
  getReservation,
  listReservations,
  updateReservation,
} from './reservationApi';

describe('reservationApi', () => {
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

  it('calls list reservations with auth header and query', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listReservations({ status: 'CONFIRMED', resourceId: 'resource-1' }, 'token-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/reservations?resourceId=resource-1&status=CONFIRMED',
      expect.any(Object),
    );
  });

  it('throws when access token is missing', async () => {
    await expect(listReservations(undefined, '')).rejects.toThrow('Not authenticated');
  });

  it('gets a reservation by id', async () => {
    mockOk({ id: 'res-1' });
    await expect(getReservation('res-1', 'token')).resolves.toEqual({ id: 'res-1' });
  });

  it('creates a reservation', async () => {
    mockOk({ id: 'res-1' });
    const result = await createReservation(
      {
        resourceId: 'resource-1',
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      },
      'token-123',
    );
    expect(result.id).toBe('res-1');
  });

  it('updates a reservation', async () => {
    mockOk({ id: 'res-1', notes: 'Updated' });
    await expect(updateReservation('res-1', { notes: 'Updated' }, 'token')).resolves.toEqual({
      id: 'res-1',
      notes: 'Updated',
    });
  });

  it('cancels a reservation', async () => {
    mockOk({ id: 'res-1', status: 'CANCELLED' });
    await expect(cancelReservation('res-1', 'token')).resolves.toEqual({
      id: 'res-1',
      status: 'CANCELLED',
    });
  });
});
