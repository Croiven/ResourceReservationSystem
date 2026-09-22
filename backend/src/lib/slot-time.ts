export const SLOT_MINUTES = 30;
export const SLOT_MS = SLOT_MINUTES * 60 * 1000;

export function isSlotAligned(date: Date): boolean {
  return date.getTime() % SLOT_MS === 0;
}

export function isValidSlotRange(startTime: Date, endTime: Date): boolean {
  if (endTime <= startTime) {
    return false;
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  return isSlotAligned(startTime) && isSlotAligned(endTime) && durationMs % SLOT_MS === 0;
}

export function assertValidSlotRange(startTime: Date, endTime: Date): void {
  if (!isSlotAligned(startTime) || !isSlotAligned(endTime)) {
    throw new Error('Start and end times must align to 30-minute slots');
  }

  if (endTime <= startTime) {
    throw new Error('End time must be after start time');
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  if (durationMs % SLOT_MS !== 0) {
    throw new Error('Reservation duration must be a multiple of 30 minutes');
  }
}
