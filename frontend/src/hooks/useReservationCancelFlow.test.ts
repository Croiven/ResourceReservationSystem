import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Reservation } from '../types/reservation';
import { useReservationCancelFlow } from './useReservationCancelFlow';

vi.mock('../services/reservationApi', () => ({
  cancelReservation: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(),
}));

import { cancelReservation } from '../services/reservationApi';
import { getTokens } from '../services/tokenStorage';

const sampleReservation = {
  id: 'res-1',
  resource: { name: 'Room A' },
} as Reservation;

describe('useReservationCancelFlow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('cancels reservation and reloads list', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const setPageError = vi.fn();
    vi.mocked(getTokens).mockReturnValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      accessTokenExpiresAt: Date.now() + 60_000,
    });
    vi.mocked(cancelReservation).mockResolvedValue({ ...sampleReservation, status: 'CANCELLED' });

    const { result } = renderHook(() => useReservationCancelFlow(onSuccess, setPageError));

    act(() => {
      result.current.setCancelReservation(sampleReservation);
    });

    await act(async () => {
      await result.current.handleCancelConfirm();
    });

    await waitFor(() => {
      expect(result.current.cancelReservation).toBeNull();
    });
    expect(cancelReservation).toHaveBeenCalledWith('res-1', 'token');
    expect(onSuccess).toHaveBeenCalled();
  });
});
