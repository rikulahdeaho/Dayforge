export function getCurrentMondayBasedDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

export function getDateForMondayBasedDayIndex(dayIndex: number, baseDate = new Date()) {
  const safeIndex = Math.max(0, Math.min(6, dayIndex));
  const mondayBasedTodayIndex = getCurrentMondayBasedDayIndex(baseDate);
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(baseDate.getDate() - mondayBasedTodayIndex + safeIndex);
  return date;
}

export function getWeekStartDate(baseDate = new Date()) {
  return getDateForMondayBasedDayIndex(0, baseDate);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateKeyForMondayBasedDayIndex(dayIndex: number, baseDate = new Date()) {
  return toDateKey(getDateForMondayBasedDayIndex(dayIndex, baseDate));
}

export function getTodayDateKey(date = new Date()) {
  return toDateKey(date);
}

export function getCurrentWeekStartDateKey(baseDate = new Date()) {
  return toDateKey(getWeekStartDate(baseDate));
}

export function getCurrentWeekRangeLabel(baseDate = new Date()) {
  const weekStart = getWeekStartDate(baseDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startLabel = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return `${startLabel} - ${endLabel}`;
}

export function formatFullDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function parseDateKeyToDate(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return new Date();
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}
