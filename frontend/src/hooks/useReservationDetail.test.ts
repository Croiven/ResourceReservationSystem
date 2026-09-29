import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { useReservationDetail } from './useReservationDetail';

vi.mock('../services/reservationApi', () => ({
  getReservation: vi.fn(),
  cancelReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(() => ({ accessToken: 'token', refreshToken: 'refresh' })),
}));

import { cancelReservation, getReservation } from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';

const reservationFixture = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: 'CONFIRMED' as const,
  notes: null,
  createdAt: '',
  updatedAt: '',
  user: { id: 'user-1', firstName: 'User', lastName: 'Test', email: 'user@example.com' },
  resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' as const },
};

describe('useReservationDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTokens).mockReturnValue({ accessToken: 'token', refreshToken: 'refresh' });
  });

  it('loads reservation data', async () => {
    vi.mocked(getReservation).mockResolvedValue(reservationFixture);

    const { result } = renderHook(() => useReservationDetail('res-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reservation?.id).toBe('res-1');
    expect(result.current.canEdit).toBe(true);
  });

  it('does not fetch when reservation id is missing', () => {
    const { result } = renderHook(() => useReservationDetail(undefined));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.reservation).toBeNull();
    expect(getReservation).not.toHaveBeenCalled();
  });

  it('requires sign-in to load reservation', async () => {
    vi.mocked(getTokens).mockReturnValue(null);

    const { result } = renderHook(() => useReservationDetail('res-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toMatch(/signed in/i);
    expect(getReservation).not.toHaveBeenCalled();
  });

  it('cancels reservation and updates state', async () => {
    vi.mocked(getReservation).mockResolvedValue(reservationFixture);
    const cancelled = { ...reservationFixture, status: 'CANCELLED' as const };
    vi.mocked(cancelReservation).mockResolvedValue(cancelled);

    const { result } = renderHook(() => useReservationDetail('res-1'));

    await waitFor(() => {
      expect(result.current.reservation?.id).toBe('res-1');
    });

    act(() => {
      result.current.setCancelOpen(true);
    });

    await act(async () => {
      await result.current.handleCancel();
    });

    expect(cancelReservation).toHaveBeenCalledWith('res-1', 'token');
    expect(result.current.reservation?.status).toBe('CANCELLED');
    expect(result.current.cancelOpen).toBe(false);
  });

  it('sets error when cancel fails', async () => {
    vi.mocked(getReservation).mockResolvedValue(reservationFixture);
    vi.mocked(cancelReservation).mockRejectedValue(new ApiError('Cannot cancel', 400));

    const { result } = renderHook(() => useReservationDetail('res-1'));

    await waitFor(() => {
      expect(result.current.reservation?.id).toBe('res-1');
    });

    await act(async () => {
      await result.current.handleCancel();
    });

    expect(result.current.error).toBe('Cannot cancel');
  });
});
