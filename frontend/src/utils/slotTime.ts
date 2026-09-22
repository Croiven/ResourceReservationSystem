export const SLOT_MINUTES = 30;
export const SLOT_MS = SLOT_MINUTES * 60 * 1000;
export const DATETIME_LOCAL_STEP_SECONDS = SLOT_MINUTES * 60;

export function dateToLocalDateTimeInput(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function isSlotAligned(value: string | Date): boolean {
  const ms = typeof value === 'string' ? new Date(value).getTime() : value.getTime();
  return ms % SLOT_MS === 0;
}

export function isSlotAlignedLocal(localValue: string): boolean {
  if (!localValue) {
    return false;
  }

  const date = new Date(localValue);
  return date.getMinutes() % SLOT_MINUTES === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

export function isValidSlotRange(start: string | Date, end: string | Date): boolean {
  const startMs = typeof start === 'string' ? new Date(start).getTime() : start.getTime();
  const endMs = typeof end === 'string' ? new Date(end).getTime() : end.getTime();
  const durationMs = endMs - startMs;

  return (
    durationMs >= SLOT_MS &&
    isSlotAligned(start) &&
    isSlotAligned(end) &&
    durationMs % SLOT_MS === 0
  );
}

export function getNextSlotAfter(from: Date): Date {
  const ms = from.getTime();
  return new Date(Math.ceil(ms / SLOT_MS) * SLOT_MS);
}

export function getMinStartDateTimeLocal(from = new Date()): string {
  return dateToLocalDateTimeInput(getNextSlotAfter(from));
}

export function getMinEndDateTimeLocal(startLocal: string): string {
  if (!startLocal) {
    return '';
  }

  const start = new Date(startLocal);
  return dateToLocalDateTimeInput(new Date(start.getTime() + SLOT_MS));
}

export function getSlotDurationMinutes(startLocal: string, endLocal: string): number {
  return (new Date(endLocal).getTime() - new Date(startLocal).getTime()) / (60 * 1000);
}

export function formatSlotDuration(totalMinutes: number): string {
  if (totalMinutes < SLOT_MINUTES) {
    return `${totalMinutes} min`;
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingAfterDays = totalMinutes - days * 24 * 60;
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`);
  }
  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  return parts.join(' ') || `${totalMinutes} min`;
}

export function isLocalDateTimeBefore(left: string, right: string): boolean {
  return left < right;
}

export function getAllTimeSlotValues(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const hourLabel = String(hour).padStart(2, '0');
    slots.push(`${hourLabel}:00`);
    slots.push(`${hourLabel}:30`);
  }
  return slots;
}

export function splitLocalDateTime(localValue: string): { date: string; time: string } {
  if (!localValue) {
    return { date: '', time: '' };
  }

  const [date = '', timePart = ''] = localValue.split('T');
  return { date, time: timePart.slice(0, 5) };
}

export function combineLocalDateTime(date: string, time: string): string {
  if (!date || !time) {
    return '';
  }

  return `${date}T${time}`;
}

export function getMinDateLocal(minDateTime?: string): string {
  if (!minDateTime) {
    return '';
  }

  return minDateTime.slice(0, 10);
}

export function getAvailableTimeSlotsForDate(date: string, minDateTime?: string): string[] {
  const allSlots = getAllTimeSlotValues();

  if (!date) {
    return [];
  }

  if (!minDateTime) {
    return allSlots;
  }

  const minDate = minDateTime.slice(0, 10);
  if (date > minDate) {
    return allSlots;
  }

  if (date < minDate) {
    return [];
  }

  const minTime = minDateTime.slice(11, 16);
  return allSlots.filter((time) => time >= minTime);
}

export function formatTimeSlotLabel(time: string): string {
  const [hoursPart = '0', minutesPart = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hoursPart), Number(minutesPart), 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
