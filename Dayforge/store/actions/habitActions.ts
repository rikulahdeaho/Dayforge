import { Habit, PlatformIconName } from '@/types';

import { createEntityId } from '../utils/id';

export const habitIcons: PlatformIconName[] = [
  { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
  { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  { ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' },
  { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
];

export function buildHabitFromTitle(title: string, index: number): Habit {
  return {
    id: createEntityId('habit'),
    title,
    subtitle: 'Daily routine',
    icon: habitIcons[index % habitIcons.length],
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
    statusLabel: 'GETTING STARTED',
  };
}

export function createHabit(input: { title: string; subtitle: string; icon: PlatformIconName }): Habit {
  const { title, subtitle, icon } = input;
  const normalizedTitle = title.trim();
  const normalizedSubtitle = subtitle.trim();

  return {
    id: createEntityId('habit'),
    title: normalizedTitle || 'New Habit',
    subtitle: normalizedSubtitle || 'Daily routine',
    icon,
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
    statusLabel: 'GETTING STARTED',
  };
}
