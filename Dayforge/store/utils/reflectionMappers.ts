import { Mood, ReflectionDraft, ReflectionHistoryItem } from '@/types';

import { formatFullDateLabel } from './date';
import { createEntityId } from './id';
import { DailyReflectionPrompts } from './reflectionPrompts';

export function buildReflectionHistoryItem({
  draft,
  prompts,
  now = new Date(),
}: {
  draft: ReflectionDraft;
  prompts?: DailyReflectionPrompts;
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
    wentWellPrompt: prompts?.wentWellPrompt.question,
    gratefulForPrompt: prompts?.gratefulForPrompt.question,
    wentWell: draft.wentWell,
    gratefulFor: draft.gratefulFor,
  };
}
