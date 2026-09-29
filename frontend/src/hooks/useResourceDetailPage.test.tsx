import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { useResourceDetailPage } from './useResourceDetailPage';

const navigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('../services/resourceApi', () => ({
  getResource: vi.fn(),
  getResourceBookings: vi.fn(),
  checkAvailability: vi.fn(),
}));

vi.mock('../services/reservationApi', () => ({
  createReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(() => ({ accessToken: 'token', refreshToken: 'refresh' })),
}));

import * as reservationApi from '../services/reservationApi';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

const resourceFixture = {
  id: 'resource-1',
  name: 'Room A',
  description: null,
  type: 'ROOM' as const,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('useResourceDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTokens).mockReturnValue({ accessToken: 'token', refreshToken: 'refresh' });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads resource and bookings', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.resource?.name).toBe('Room A');
    expect(result.current.bookings).toEqual([]);
  });

  it('marks resource as not found on 404', async () => {
    vi.mocked(resourceApi.getResource).mockRejectedValue(new ApiError('Not found', 404));

    const { result } = renderHook(() => useResourceDetailPage('missing'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.notFound).toBe(true);
    expect(result.current.resource).toBeNull();
  });

  it('sets bookingError when times are missing', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingError).toBe('Start and end times are required.');
    expect(reservationApi.createReservation).not.toHaveBeenCalled();
  });

  it('creates reservation and navigates on valid submit', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);
    vi.mocked(reservationApi.createReservation).mockResolvedValue({
      id: 'res-new',
      userId: 'user-1',
      resourceId: 'resource-1',
      startTime: '2030-06-01T10:00:00.000Z',
      endTime: '2030-06-01T11:00:00.000Z',
      status: 'CONFIRMED',
      notes: null,
      createdAt: '',
      updatedAt: '',
      user: { id: 'user-1', firstName: 'U', lastName: 'T', email: 'u@example.com' },
      resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' },
    });

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setStartTime('2030-06-01T10:00');
      result.current.setEndTime('2030-06-01T11:00');
      result.current.setNotes('  Team sync  ');
    });

    await act(async () => {
      await result.current.submitBooking();
    });

    expect(reservationApi.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceId: 'resource-1',
        notes: 'Team sync',
      }),
      'token',
    );
    expect(navigate).toHaveBeenCalledWith('/reservations/res-new');
  });

  it('surfaces API errors from createReservation', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);
    vi.mocked(reservationApi.createReservation).mockRejectedValue(
      new ApiError('Time slot unavailable', 409),
    );

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setStartTime('2030-06-01T10:00');
      result.current.setEndTime('2030-06-01T11:00');
    });

    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingError).toBe('Time slot unavailable');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('requires sign-in to book', async () => {
    vi.mocked(getTokens).mockReturnValue(null);
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setStartTime('2030-06-01T10:00');
      result.current.setEndTime('2030-06-01T11:00');
    });

    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingError).toBe('You must be signed in to book.');
  });

  it('sets bookingsError when calendar load fails', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockRejectedValue(new ApiError('Server error', 500));

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.bookingsLoading).toBe(false);
    });

    expect(result.current.bookingsError).toBe('Server error');
    expect(result.current.bookings).toEqual([]);
  });

  it('rejects invalid slot range on submit', async () => {
    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setStartTime('2030-06-01T10:00');
      result.current.setEndTime('2030-06-01T10:15');
    });

    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingError).toMatch(/30 minutes/);
    expect(reservationApi.createReservation).not.toHaveBeenCalled();
  });

  it('checks availability after debounce when times change', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));

    vi.mocked(resourceApi.getResource).mockResolvedValue(resourceFixture);
    vi.mocked(resourceApi.getResourceBookings).mockResolvedValue([]);
    vi.mocked(resourceApi.checkAvailability).mockResolvedValue({ available: true });

    const { result } = renderHook(() => useResourceDetailPage('resource-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setStartTime('2030-06-01T10:00');
      result.current.setEndTime('2030-06-01T11:00');
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await waitFor(() => {
      expect(resourceApi.checkAvailability).toHaveBeenCalled();
      expect(result.current.availabilityMessage).toEqual(expect.stringMatching(/available/i));
    });

    vi.useRealTimers();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-01T12:00:00'));
  });
});
