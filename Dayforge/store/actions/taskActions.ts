import { Task, TaskCategory } from '@/types';

import { getCurrentMondayBasedDayIndex, getDateForMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex, parseDateKeyToDate } from '../appState.helpers';
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

export function createTask(input: { title: string; dayIndex?: number; dateKey?: string; category: TaskCategory }): Task {
  const { title, dayIndex = getCurrentMondayBasedDayIndex(), dateKey, category } = input;
  const normalizedTitle = title.trim();

  return {
    id: createEntityId('task'),
    title: normalizedTitle || 'New task',
    category,
    dateKey: dateKey ?? getDateKeyForMondayBasedDayIndex(dayIndex),
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

export function formatTaskDateLabel(dateKey: string) {
  const date = parseDateKeyToDate(dateKey);
  const dateDayIndex = getCurrentMondayBasedDayIndex(date);
  const currentWeekDateKey = getDateKeyForMondayBasedDayIndex(dateDayIndex);

  if (dateKey === currentWeekDateKey) {
    return formatTaskDayLabel(dateDayIndex);
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
