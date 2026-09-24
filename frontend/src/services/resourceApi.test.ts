import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkAvailability,
  createResource,
  deactivateResource,
  getResource,
  getResourceBookings,
  listResources,
  updateResource,
} from './resourceApi';

describe('resourceApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls list endpoint without query params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listResources();

    expect(mockFetch).toHaveBeenCalledWith('/api/resources', expect.any(Object));
  });

  it('builds query string for list filters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await listResources({
      active: 'true',
      type: 'ROOM',
      search: 'conference',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/resources?active=true&type=ROOM&search=conference',
      expect.any(Object),
    );
  });

  it('calls get resource endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'resource-1',
            name: 'Conference Room A',
            description: 'Large meeting room',
            type: 'ROOM',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await getResource('resource-1');

    expect(result.name).toBe('Conference Room A');
    expect(mockFetch).toHaveBeenCalledWith('/api/resources/resource-1', expect.any(Object));
  });

  it('calls resource bookings endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await getResourceBookings(
      'resource-1',
      '2030-01-01T00:00:00.000Z',
      '2030-02-01T00:00:00.000Z',
    );

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/resources/resource-1/bookings?from=2030-01-01T00%3A00%3A00.000Z&to=2030-02-01T00%3A00%3A00.000Z',
      expect.any(Object),
    );
  });

  it('passes excludeReservationId when checking availability for reschedule', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { available: true } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await checkAvailability(
      'resource-1',
      '2030-01-01T10:00:00.000Z',
      '2030-01-01T12:00:00.000Z',
      'res-1',
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('excludeReservationId=res-1'),
      expect.any(Object),
    );
  });

  it('calls availability check endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { available: true } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await checkAvailability(
      'resource-1',
      '2030-01-01T10:00:00.000Z',
      '2030-01-01T11:00:00.000Z',
    );

    expect(result.available).toBe(true);
  });

  it('calls create resource endpoint with auth header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'resource-1',
            name: 'New Room',
            description: null,
            type: 'ROOM',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await createResource({ name: 'New Room', type: 'ROOM' }, 'token-123');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token-123');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/resources',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('calls update resource endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'resource-1',
            name: 'Updated Room',
            description: null,
            type: 'ROOM',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await updateResource('resource-1', { name: 'Updated Room' }, 'token-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/resources/resource-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('calls deactivate resource endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            id: 'resource-1',
            name: 'Room',
            description: null,
            type: 'ROOM',
            isActive: false,
            createdAt: '',
            updatedAt: '',
          },
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await deactivateResource('resource-1', 'token-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/resources/resource-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
