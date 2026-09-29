import { describe, expect, it } from 'vitest';
import { assertValidSlotRange, isSlotAligned, isValidSlotRange, SLOT_MS } from './slot-time.js';

function slotDate(iso: string): Date {
  return new Date(iso);
}

describe('slot-time', () => {
  it('detects slot-aligned timestamps', () => {
    const aligned = slotDate('2030-01-01T10:00:00.000Z');
    expect(isSlotAligned(aligned)).toBe(true);
    expect(aligned.getTime() % SLOT_MS).toBe(0);
  });

  it('validates a proper slot range', () => {
    const start = slotDate('2030-01-01T10:00:00.000Z');
    const end = slotDate('2030-01-01T11:00:00.000Z');
    expect(isValidSlotRange(start, end)).toBe(true);
  });

  it('rejects end before start', () => {
    const start = slotDate('2030-01-01T11:00:00.000Z');
    const end = slotDate('2030-01-01T10:00:00.000Z');
    expect(isValidSlotRange(start, end)).toBe(false);
  });

  it('rejects misaligned slots in assertValidSlotRange', () => {
    const start = slotDate('2030-01-01T10:15:00.000Z');
    const end = slotDate('2030-01-01T11:00:00.000Z');
    expect(() => assertValidSlotRange(start, end)).toThrow('30-minute slots');
  });

  it('rejects end before start in assertValidSlotRange', () => {
    const start = slotDate('2030-01-01T11:00:00.000Z');
    const end = slotDate('2030-01-01T10:00:00.000Z');
    expect(() => assertValidSlotRange(start, end)).toThrow('after start time');
  });

  it('rejects ranges whose duration is not a multiple of 30 minutes', () => {
    const start = slotDate('2030-01-01T10:00:00.000Z');
    const end = slotDate('2030-01-01T10:20:00.000Z');
    expect(isValidSlotRange(start, end)).toBe(false);
  });
});
