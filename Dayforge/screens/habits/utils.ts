import { PlatformIconName } from '@/types';

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_FULL_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HABIT_ICON_ID_BY_IOS_NAME: Record<string, string> = {
  'figure.mind.and.body': 'figure.mind.and.body',
  'book.fill': 'book.fill',
  'drop.fill': 'drop.fill',
  'dumbbell.fill': 'dumbbell.fill',
  'moon.stars.fill': 'moon.stars.fill',
  'heart.fill': 'heart.fill',
};

export function resolveStreakPillText(totalCount: number, completedCount: number) {
  if (!totalCount) {
    return 'START YOUR STREAK';
  }

  if (completedCount >= totalCount) {
    return 'PERFECT DAY';
  }

  if (completedCount / totalCount >= 0.6) {
    return 'MOMENTUM HIGH';
  }

  return 'STREAK ACTIVE';
}

export function resolveHeroBody(totalCount: number, completedCount: number, nextHabitTitle?: string) {
  const habitsLeft = Math.max(0, totalCount - completedCount);

  if (!totalCount) {
    return 'Add your first habit. Build a steady rhythm.';
  }

  if (habitsLeft === 0) {
    return 'Everything is done. Keep it steady tomorrow.';
  }

  if (habitsLeft === 1 && nextHabitTitle) {
    return `Only one left: ${nextHabitTitle}. Finish strong.`;
  }

  return `${habitsLeft} habits left. Keep the rhythm going.`;
}

export function resolveHabitStatus(weeklyProgress: boolean[]) {
  const completedDays = weeklyProgress.filter(Boolean).length;

  if (completedDays >= 6) {
    return {
      label: 'STREAKING',
      icon: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' } as PlatformIconName,
    };
  }

  if (completedDays >= 4) {
    return {
      label: 'ON TRACK',
      icon: { ios: 'bolt.fill', android: 'flash_on', web: 'flash_on' } as PlatformIconName,
    };
  }

  if (completedDays >= 2) {
    return {
      label: 'CONSISTENT',
      icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as PlatformIconName,
    };
  }

  return {
    label: 'BUILDING',
    icon: { ios: 'leaf.fill', android: 'eco', web: 'eco' } as PlatformIconName,
  };
}
