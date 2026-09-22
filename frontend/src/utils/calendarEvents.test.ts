import { describe, expect, it } from 'vitest';
import type { ResourceBooking } from '../types/reservation';
import { getWeekStart } from './calendar';
import { buildCalendarEvents, formatEventTimeLabel } from './calendarEvents';

const ROW_HEIGHT = 20;

function makeBooking(startTime: string, endTime: string): ResourceBooking {
  return { startTime, endTime, status: 'CONFIRMED' };
}

describe('calendarEvents', () => {
  it('creates a segment for each day of a multi-day booking', () => {
    const weekStart = getWeekStart(new Date('2026-06-01T12:00:00.000Z'));
    const booking = makeBooking('2026-06-02T20:00:00', '2026-06-04T10:00:00');

    const events = buildCalendarEvents([booking], weekStart, ROW_HEIGHT);

    expect(events).toHaveLength(3);
    expect(events.map((event) => event.dayIndex)).toEqual([1, 2, 3]);
  });

  it('labels middle days as all day and edge days with partial times', () => {
    const weekStart = getWeekStart(new Date('2026-06-01T12:00:00.000Z'));
    const booking = makeBooking('2026-06-02T20:00:00', '2026-06-04T10:00:00');

    const events = buildCalendarEvents([booking], weekStart, ROW_HEIGHT);

    expect(formatEventTimeLabel(events[0]!)).toMatch(/^From /);
    expect(formatEventTimeLabel(events[1]!)).toBe('All day');
    expect(formatEventTimeLabel(events[2]!)).toMatch(/^Until /);
  });

  it('renders a midnight-to-midnight segment for full middle days', () => {
    const weekStart = getWeekStart(new Date('2026-06-01T12:00:00.000Z'));
    const booking = makeBooking('2026-06-02T20:00:00', '2026-06-04T10:00:00');

    const events = buildCalendarEvents([booking], weekStart, ROW_HEIGHT);
    const middleDay = events[1]!;

    expect(middleDay.topPx).toBe(0);
    expect(middleDay.heightPx).toBe(48 * ROW_HEIGHT);
  });
});
