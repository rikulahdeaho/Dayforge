import { Mood, ReflectionDraft, ReflectionHistoryItem } from '../types';

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

export function createEntityId(prefix: string, now = Date.now()) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${now}-${randomPart}`;
}

export function buildReflectionHistoryItem({
  draft,
  now = new Date(),
}: {
  draft: ReflectionDraft;
  now?: Date;
}): ReflectionHistoryItem {
  const fallbackPreview = 'A calm and focused day with steady progress.';
  const previewSource = draft.wentWell.trim() || draft.gratefulFor.trim() || fallbackPreview;
  const preview = previewSource.length > 84 ? `${previewSource.slice(0, 84)}...` : previewSource;
  const dateLabel = now.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const fullDate = formatFullDateLabel(now);

  return {
    id: createEntityId('reflection', now.getTime()),
    dateLabel,
    fullDate,
    mood: draft.mood as Mood,
    preview,
    wentWell: draft.wentWell,
    gratefulFor: draft.gratefulFor,
  };
}
