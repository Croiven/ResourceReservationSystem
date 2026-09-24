import { describe, expect, it } from 'vitest';
import {
  hasReservationStarted,
  isReservationCancellable,
  isReservationEditable,
} from './reservationRules';

describe('reservationRules', () => {
  it('allows editing future active reservations', () => {
    expect(
      isReservationEditable({
        status: 'CONFIRMED',
        startTime: '2030-01-01T12:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('disallows editing reservations that have already started', () => {
    expect(
      isReservationEditable({
        status: 'CONFIRMED',
        startTime: '2020-01-01T12:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('disallows editing cancelled reservations', () => {
    expect(
      isReservationEditable({
        status: 'CANCELLED',
        startTime: '2030-01-01T12:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('detects when a reservation has started', () => {
    expect(hasReservationStarted({ startTime: '2020-01-01T12:00:00.000Z' })).toBe(true);
    expect(hasReservationStarted({ startTime: '2030-01-01T12:00:00.000Z' })).toBe(false);
  });

  it('allows cancelling active reservations', () => {
    expect(isReservationCancellable({ status: 'CONFIRMED' })).toBe(true);
    expect(isReservationCancellable({ status: 'CANCELLED' })).toBe(false);
  });
});
