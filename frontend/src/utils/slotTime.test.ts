import { describe, expect, it } from 'vitest';
import {
  combineLocalDateTime,
  dateToLocalDateTimeInput,
  formatSlotDuration,
  getAllTimeSlotValues,
  getAvailableTimeSlotsForDate,
  getEditMinStartDateTimeLocal,
  getLocalSlotRangeFeedback,
  getMinEndDateTimeLocal,
  getMinStartDateTimeLocal,
  getNextSlotAfter,
  getSlotDurationMinutes,
  isLocalDateTimeBefore,
  isSlotAlignedLocal,
  isValidLocalSlotRange,
  isValidSlotRange,
  slotAvailabilityFeedback,
  splitLocalDateTime,
} from './slotTime';

describe('slotTime', () => {
  it('validates aligned 30-minute ranges', () => {
    expect(isValidSlotRange('2030-01-01T10:00:00.000Z', '2030-01-01T10:30:00.000Z')).toBe(true);
    expect(isValidSlotRange('2030-01-01T10:00:00.000Z', '2030-01-01T13:00:00.000Z')).toBe(true);
    expect(isValidSlotRange('2030-01-01T10:15:00.000Z', '2030-01-01T10:45:00.000Z')).toBe(false);
    expect(isValidSlotRange('2030-01-01T10:00:00.000Z', '2030-01-01T10:45:00.000Z')).toBe(false);
    expect(isValidSlotRange('2030-01-01T10:00:00.000Z', '2030-01-01T10:15:00.000Z')).toBe(false);
  });

  it('formats durations with days and hours', () => {
    expect(formatSlotDuration(30)).toBe('30 min');
    expect(formatSlotDuration(180)).toBe('3 h');
    expect(formatSlotDuration(34 * 60)).toBe('1 day 10 h');
  });

  it('detects local slot alignment', () => {
    expect(isSlotAlignedLocal('2030-06-01T10:00')).toBe(true);
    expect(isSlotAlignedLocal('2030-06-01T10:30')).toBe(true);
    expect(isSlotAlignedLocal('2030-06-01T10:15')).toBe(false);
  });

  it('computes the next slot after a timestamp', () => {
    const from = new Date('2030-06-01T10:17:00.000Z');
    const next = getNextSlotAfter(from);
    expect(next.getTime() % (30 * 60 * 1000)).toBe(0);
    expect(next.getTime()).toBeGreaterThan(from.getTime());
  });

  it('builds minimum end datetime-local thirty minutes after start', () => {
    const minEnd = getMinEndDateTimeLocal('2030-06-01T10:00');
    expect(getSlotDurationMinutes('2030-06-01T10:00', minEnd)).toBe(30);
  });

  it('builds minimum start at or after the provided instant', () => {
    const from = new Date('2030-06-01T10:17:00.000Z');
    const minStart = getMinStartDateTimeLocal(from);
    expect(new Date(minStart).getTime()).toBeGreaterThanOrEqual(getNextSlotAfter(from).getTime() - 1000);
  });

  it('calculates slot duration between local values', () => {
    expect(getSlotDurationMinutes('2030-06-01T10:00', '2030-06-01T11:30')).toBe(90);
  });

  it('converts dates to datetime-local strings', () => {
    expect(dateToLocalDateTimeInput(new Date('2030-06-01T10:00:00'))).toMatch(/T10:00$/);
  });

  it('lists only 30-minute time slot values', () => {
    const slots = getAllTimeSlotValues();
    expect(slots).toHaveLength(48);
    expect(slots[0]).toBe('00:00');
    expect(slots[1]).toBe('00:30');
    expect(slots).not.toContain('00:15');
  });

  it('filters available times on the minimum date', () => {
    expect(getAvailableTimeSlotsForDate('2030-06-01', '2030-06-01T10:30')).toEqual(
      getAllTimeSlotValues().filter((time) => time >= '10:30'),
    );
    expect(getAvailableTimeSlotsForDate('2030-06-02', '2030-06-01T10:30')).toEqual(
      getAllTimeSlotValues(),
    );
  });

  it('splits and combines local datetime values', () => {
    expect(splitLocalDateTime('2030-06-01T10:30')).toEqual({
      date: '2030-06-01',
      time: '10:30',
    });
    expect(combineLocalDateTime('2030-06-01', '10:30')).toBe('2030-06-01T10:30');
  });

  it('returns specific feedback for invalid local slot ranges', () => {
    expect(getLocalSlotRangeFeedback('2030-06-01T10:15', '2030-06-01T11:00')?.message).toMatch(
      /start time must be on the hour or half-hour/i,
    );
    expect(getLocalSlotRangeFeedback('2030-06-01T10:00', '2030-06-01T10:45')?.message).toMatch(
      /end time must be on the hour or half-hour/i,
    );
    expect(getLocalSlotRangeFeedback('2030-06-01T11:00', '2030-06-01T10:00')?.message).toMatch(
      /after start time/i,
    );
  });

  it('describes overlap availability clearly', () => {
    expect(slotAvailabilityFeedback(false).message).toMatch(/overlaps another booking/i);
  });

  it('validates datetime-local slot ranges for edit forms', () => {
    expect(isValidLocalSlotRange('2030-06-01T10:00', '2030-06-01T11:00')).toBe(true);
    expect(isValidLocalSlotRange('2030-06-01T10:15', '2030-06-01T11:00')).toBe(false);
  });

  it('keeps the booked start selectable before the reservation begins', () => {
    const reservationStartIso = '2030-06-01T10:00:00.000Z';
    const now = new Date('2030-06-01T09:00:00.000Z');
    const minStart = getEditMinStartDateTimeLocal(reservationStartIso, now);
    const bookedLocal = dateToLocalDateTimeInput(new Date(reservationStartIso));
    expect(isLocalDateTimeBefore(bookedLocal, minStart)).toBe(false);
  });
});
