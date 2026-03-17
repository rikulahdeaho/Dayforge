import { Mood, ReflectionDraft, ReflectionHistoryItem } from '../types';

export function getCurrentMondayBasedDayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
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

  return {
    id: `reflection-${now.getTime()}`,
    dateLabel,
    mood: draft.mood as Mood,
    preview,
    wentWell: draft.wentWell,
    gratefulFor: draft.gratefulFor,
  };
}
