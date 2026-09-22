import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAvailability, getResource, getResourceBookings, listResources } from './resourceApi';

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
});
