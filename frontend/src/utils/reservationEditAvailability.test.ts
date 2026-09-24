import { describe, expect, it, vi } from 'vitest';
import * as resourceApi from '../services/resourceApi';
import { toLocalDateTimeInput } from './dateTime';
import {
  checkEditAvailability,
  isSameInstant,
  isWithinOriginalBookingWindow,
} from './reservationEditAvailability';
import type { Reservation } from '../types/reservation';

const baseReservation: Reservation = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: 'CONFIRMED',
  notes: null,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
  user: {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'user@example.com',
  },
  resource: { id: 'resource-1', name: 'Room A', type: 'ROOM' },
};

describe('reservationEditAvailability', () => {
  it('detects same instants across iso strings', () => {
    expect(isSameInstant('2030-01-01T10:00:00.000Z', '2030-01-01T10:00:00.000Z')).toBe(true);
  });

  it('detects when a proposed range stays within the original booking', () => {
    expect(
      isWithinOriginalBookingWindow(
        baseReservation,
        '2030-01-01T10:00:00.000Z',
        '2030-01-01T10:30:00.000Z',
      ),
    ).toBe(true);
    expect(
      isWithinOriginalBookingWindow(
        baseReservation,
        '2030-01-01T09:30:00.000Z',
        '2030-01-01T11:00:00.000Z',
      ),
    ).toBe(false);
  });

  it('treats unchanged times as available without calling the API', async () => {
    const spy = vi.spyOn(resourceApi, 'checkAvailability');
    // Local values that round-trip to the reservation instants (UTC+2/+3 in CI may vary — use ISO path via same instants)
    const feedback = await checkEditAvailability(
      baseReservation,
      toLocalDateTimeInput(baseReservation.startTime),
      toLocalDateTimeInput(baseReservation.endTime),
    );
    expect(feedback.message).toMatch(/available/i);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('maps inactive resource responses to a clear message', async () => {
    vi.spyOn(resourceApi, 'checkAvailability').mockResolvedValue({
      available: false,
      reason: 'RESOURCE_INACTIVE',
    });

    const feedback = await checkEditAvailability(baseReservation, '2030-01-01T12:00', '2030-01-01T14:00');
    expect(feedback.message).toMatch(/no longer active/i);
    vi.restoreAllMocks();
  });
});
