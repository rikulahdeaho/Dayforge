import { AppState } from '../appState.types';
import { buildReflectionHistoryItem, getDailyReflectionPrompts } from '../appState.helpers';

export function saveReflectionDraft(state: AppState) {
  const { mood, wentWell, gratefulFor } = state.reflectionDraft;

  if (!mood) {
    return { ok: false as const, reason: 'mood-required' as const };
  }

  if (!wentWell.trim() && !gratefulFor.trim()) {
    return { ok: false as const, reason: 'entry-required' as const };
  }

  const now = new Date();
  const historyItem = buildReflectionHistoryItem({
    draft: state.reflectionDraft,
    prompts: getDailyReflectionPrompts(),
    now,
  });

  return {
    ok: true as const,
    historyItem,
    streakDays: 1,
    successMessage: 'Reflection saved. +1 day streak.',
  };
}
