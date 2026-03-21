import { AppState } from '../appState.types';
import { getCurrentWeekStartDateKey } from '../appState.helpers';
import { getEmptyAppState } from '../appState.reducer';
import { createEntityId } from '../utils/id';
import { buildHabitFromTitle } from './habitActions';
import { buildTaskFromTitle } from './taskActions';

type OnboardingInput = {
  name: string;
  personalGoals: string;
  reminders: string;
  darkMode: boolean;
  weeklyGoalTitle: string;
  weeklyGoalTarget: number;
  tasks: string[];
  habits: string[];
};

export function buildCompletedOnboardingState(input: OnboardingInput): AppState {
  const normalizedName = input.name.trim() || 'New User';
  const initials =
    normalizedName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NU';
  const normalizedTasks = input.tasks.map((task) => task.trim()).filter(Boolean);
  const normalizedHabits = input.habits.map((habit) => habit.trim()).filter(Boolean);

  return {
    ...getEmptyAppState(),
    hasCompletedOnboarding: true,
    user: {
      name: normalizedName,
      membership: 'Free Member',
      avatar: initials,
      personalGoals: input.personalGoals.trim() || 'Define your personal goals.',
      reminders: input.reminders.trim() || 'No reminders configured yet.',
    },
    preferences: {
      darkMode: input.darkMode,
    },
    goal: {
      id: createEntityId('goal'),
      title: input.weeklyGoalTitle.trim() || 'Set your weekly goal',
      label: 'Weekly Focus',
      progress: 0,
      target: Math.max(1, Math.trunc(input.weeklyGoalTarget || 1)),
      progressByWeek: {
        [getCurrentWeekStartDateKey()]: 0,
      },
    },
    tasks: (normalizedTasks.length ? normalizedTasks : ['First task placeholder']).map(buildTaskFromTitle),
    habits: (normalizedHabits.length ? normalizedHabits : ['First habit placeholder']).map(buildHabitFromTitle),
    weeklyPlan: {
      weekStartDateKey: getCurrentWeekStartDateKey(),
      beforeYouBegin: '',
      pace: 'Balanced',
      protectedHabitIds: [],
    },
  };
}

export function buildSkippedOnboardingState(): AppState {
  const emptyState = getEmptyAppState();

  return {
    ...emptyState,
    hasCompletedOnboarding: true,
    tasks: [buildTaskFromTitle('First task placeholder')],
    habits: [buildHabitFromTitle('First habit placeholder', 0)],
  };
}
