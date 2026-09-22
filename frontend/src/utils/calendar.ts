export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWeekStart(date = new Date()): Date {
  return startOfWeek(date);
}

export function weekRangeIso(weekStart: Date): { from: string; to: string } {
  const from = new Date(weekStart);
  from.setHours(0, 0, 0, 0);
  const to = addDays(from, 7);
  to.setMilliseconds(to.getMilliseconds() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}
