import { Task, TaskCategory } from '@/types';

import { getCurrentMondayBasedDayIndex, getDateForMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex } from '../appState.helpers';
import { createEntityId } from '../utils/id';

export function buildTaskFromTitle(title: string): Task {
  return {
    id: createEntityId('task'),
    title,
    category: 'must-do',
    dateKey: getDateKeyForMondayBasedDayIndex(getCurrentMondayBasedDayIndex()),
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
  };
}

export function createTask(input: { title: string; dayIndex?: number; category: TaskCategory }): Task {
  const { title, dayIndex = getCurrentMondayBasedDayIndex(), category } = input;
  const normalizedTitle = title.trim();

  return {
    id: createEntityId('task'),
    title: normalizedTitle || 'New task',
    category,
    dateKey: getDateKeyForMondayBasedDayIndex(dayIndex),
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
  };
}

export function formatTaskDayLabel(dayIndex: number) {
  const now = new Date();
  const todayIndex = getCurrentMondayBasedDayIndex(now);
  const tomorrowIndex = (todayIndex + 1) % 7;
  const date = getDateForMondayBasedDayIndex(dayIndex, now);
  const compactDate = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  if (dayIndex === todayIndex) {
    return 'today';
  }
  if (dayIndex === tomorrowIndex) {
    return `tomorrow (${compactDate})`;
  }
  return compactDate;
}
