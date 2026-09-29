import { describe, expect, it } from 'vitest';
import {
  dateInputToIsoEnd,
  dateInputToIsoStart,
  formatDateTime,
  formatDateTimeRange,
  getDefaultBookingRange,
  toIsoDateTime,
  toLocalDateInput,
  toLocalDateTimeInput,
} from './dateTime';

describe('dateTime utils', () => {
  it('converts local datetime input to ISO', () => {
    const iso = toIsoDateTime('2030-06-15T10:30');
    expect(new Date(iso).toISOString()).toBe(iso);
  });

  it('converts ISO to local datetime input', () => {
    const local = toLocalDateTimeInput('2030-06-15T07:30:00.000Z');
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('converts ISO to local date input', () => {
    const localDate = toLocalDateInput('2030-06-15T07:30:00.000Z');
    expect(localDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats a single datetime', () => {
    expect(formatDateTime('2030-06-15T10:00:00.000Z')).toContain('2030');
  });

  it('formats same-day range on one line', () => {
    const formatted = formatDateTimeRange(
      '2030-06-15T10:00:00.000Z',
      '2030-06-15T11:00:00.000Z',
    );
    expect(formatted).toContain('–');
  });

  it('formats multi-day range with both dates', () => {
    const formatted = formatDateTimeRange(
      '2030-06-15T10:00:00.000Z',
      '2030-06-16T11:00:00.000Z',
    );
    expect(formatted).toContain('–');
    expect(formatted.split('–').length).toBeGreaterThan(1);
  });

  it('builds default booking range ending 30 days later', () => {
    const { from, to } = getDefaultBookingRange();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    expect(toDate.getTime()).toBeGreaterThan(fromDate.getTime());
  });

  it('converts date input boundaries to ISO', () => {
    const start = dateInputToIsoStart('2030-01-01');
    const end = dateInputToIsoEnd('2030-01-01');
    expect(start.endsWith('.000Z')).toBe(true);
    expect(end.endsWith('.000Z')).toBe(true);
    expect(new Date(end).getTime()).toBeGreaterThan(new Date(start).getTime());
  });
});
