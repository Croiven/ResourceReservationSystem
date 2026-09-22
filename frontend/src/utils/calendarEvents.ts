import type { ResourceBooking } from '../types/reservation';
import { addDays } from './calendar';
import { SLOT_MINUTES } from './slotTime';

export const MINUTES_PER_DAY = 24 * 60;
export const CALENDAR_START_MINUTE = 0;
export const CALENDAR_END_MINUTE = MINUTES_PER_DAY;

export interface CalendarEvent {
  booking: ResourceBooking;
  dayIndex: number;
  topPx: number;
  heightPx: number;
  visibleStart: Date;
  visibleEnd: Date;
  continuesFromPreviousDay: boolean;
  continuesToNextDay: boolean;
}

function minutesFromDayStart(dayStart: Date, instant: Date): number {
  return (instant.getTime() - dayStart.getTime()) / (60 * 1000);
}

export function buildCalendarEvents(
  bookings: ResourceBooking[],
  weekStart: Date,
  rowHeightPx: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const totalMinutes = CALENDAR_END_MINUTE - CALENDAR_START_MINUTE;
  const totalRows = totalMinutes / SLOT_MINUTES;

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const dayStart = addDays(weekStart, dayIndex);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = addDays(dayStart, 1);

    for (const booking of bookings) {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      if (bookingEnd <= dayStart || bookingStart >= dayEnd) {
        continue;
      }

      const visibleStart = bookingStart < dayStart ? dayStart : bookingStart;
      const visibleEnd = bookingEnd > dayEnd ? dayEnd : bookingEnd;

      const startMinutes = minutesFromDayStart(dayStart, visibleStart);
      const endMinutes = minutesFromDayStart(dayStart, visibleEnd);

      const clippedStart = Math.max(startMinutes, CALENDAR_START_MINUTE);
      const clippedEnd = Math.min(endMinutes, CALENDAR_END_MINUTE);

      if (clippedEnd <= clippedStart) {
        continue;
      }

      events.push({
        booking,
        dayIndex,
        topPx: ((clippedStart - CALENDAR_START_MINUTE) / totalMinutes) * totalRows * rowHeightPx,
        heightPx: Math.max(
          rowHeightPx / 2,
          ((clippedEnd - clippedStart) / totalMinutes) * totalRows * rowHeightPx,
        ),
        visibleStart,
        visibleEnd,
        continuesFromPreviousDay: bookingStart < dayStart,
        continuesToNextDay: bookingEnd > dayEnd,
      });
    }
  }

  return events;
}

export function formatEventTimeLabel(event: CalendarEvent): string {
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (event.continuesFromPreviousDay && event.continuesToNextDay) {
    return 'All day';
  }

  if (event.continuesFromPreviousDay) {
    return `Until ${timeFormatter.format(event.visibleEnd)}`;
  }

  if (event.continuesToNextDay) {
    return `From ${timeFormatter.format(event.visibleStart)}`;
  }

  return `${timeFormatter.format(event.visibleStart)} – ${timeFormatter.format(event.visibleEnd)}`;
}
