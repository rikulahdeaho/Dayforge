import {
  DEMO_GOAL,
  DEMO_HABITS,
  DEMO_PREFERENCES,
  DEMO_REFLECTION_DRAFT,
  DEMO_REFLECTION_HISTORY,
  DEMO_TASKS,
  DEMO_USER,
  DEMO_WEEKLY_PLANS_BY_WEEK,
} from '../data/mockData';
import { Habit, PlatformIconName, Task, WeeklyPlan, WeeklyPlansByWeek } from '../types';

import { AppState, AppStateAction } from './appState.types';
import {
  getCurrentMondayBasedDayIndex,
  getCurrentWeekStartDateKey,
  getDateKeyForMondayBasedDayIndex,
  getTodayDateKey,
} from './appState.helpers';

export function getInitialAppState(): AppState {
  return {
    hasCompletedOnboarding: true,
    user: DEMO_USER,
    preferences: DEMO_PREFERENCES,
    habits: DEMO_HABITS,
    goal: DEMO_GOAL,
    tasks: DEMO_TASKS,
    reflectionDraft: DEMO_REFLECTION_DRAFT,
    reflectionHistory: DEMO_REFLECTION_HISTORY,
    weeklyPlansByWeek: DEMO_WEEKLY_PLANS_BY_WEEK,
  };
}

export function getEmptyAppState(): AppState {
  return {
    hasCompletedOnboarding: false,
    user: {
      name: 'New User',
      membership: 'Free Member',
      avatar: 'NU',
      personalGoals: 'Set your first personal goals.',
      reminders: 'No reminders configured yet.',
    },
    preferences: {
      darkMode: true,
    },
    habits: [],
    goal: {
      id: 'goal-empty',
      title: 'Set your weekly goal',
      label: 'Weekly Focus',
      progress: 0,
      target: 1,
      progressByWeek: {
        [getCurrentWeekStartDateKey()]: 0,
      },
    },
    tasks: [],
    reflectionDraft: {
      mood: null,
      wentWell: '',
      gratefulFor: '',
    },
    reflectionHistory: [],
    weeklyPlansByWeek: {
      [getCurrentWeekStartDateKey()]: {
        beforeYouBegin: '',
        pace: 'Balanced',
        protectedHabitIds: [],
      },
    },
  };
}

const initialState = getEmptyAppState();

const legacyHabitIcons: Record<string, PlatformIconName> = {
  'figure.mind.and.body': { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
  'book.fill': { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
  'drop.fill': { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
  'dumbbell.fill': { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  'moon.stars.fill': { ios: 'moon.stars.fill', android: 'bedtime', web: 'bedtime' },
  'heart.fill': { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
};

function normalizeHabitIcon(icon: Habit['icon'] | string): PlatformIconName {
  if (icon && typeof icon === 'object' && 'ios' in icon && 'android' in icon && 'web' in icon) {
    return icon;
  }

  if (typeof icon === 'string' && legacyHabitIcons[icon]) {
    return legacyHabitIcons[icon];
  }

  return { ios: 'heart.fill', android: 'favorite', web: 'favorite' };
}

function normalizeWeeklyProgress(progress: unknown, fallback = false): boolean[] {
  if (!Array.isArray(progress)) {
    return Array(7).fill(fallback);
  }

  return Array.from({ length: 7 }, (_, index) => Boolean(progress[index]));
}

function normalizeCompletionByDate(
  completionByDate: unknown,
  weeklyProgress: boolean[],
  completedFallback = false
): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  if (completionByDate && typeof completionByDate === 'object' && !Array.isArray(completionByDate)) {
    for (const [dateKey, value] of Object.entries(completionByDate as Record<string, unknown>)) {
      if (value) {
        result[dateKey] = true;
      }
    }
  }

  const hasAnyDate = Object.keys(result).length > 0;
  if (!hasAnyDate) {
    weeklyProgress.forEach((done, dayIndex) => {
      if (done) {
        result[getDateKeyForMondayBasedDayIndex(dayIndex)] = true;
      }
    });
  }

  if (!hasAnyDate && completedFallback) {
    result[getTodayDateKey()] = true;
  }

  return result;
}

function buildWeeklyProgressFromDateMap(completionByDate: Record<string, boolean>) {
  return Array.from({ length: 7 }, (_, dayIndex) => Boolean(completionByDate[getDateKeyForMondayBasedDayIndex(dayIndex)]));
}

function normalizePersistedHabit(habit: Habit): Habit {
  const weeklyProgress = normalizeWeeklyProgress(habit.weeklyProgress);
  const completionByDate = normalizeCompletionByDate((habit as Habit).completionByDate, weeklyProgress);
  const normalizedWeeklyProgress = buildWeeklyProgressFromDateMap(completionByDate);
  const todayIndex = getCurrentMondayBasedDayIndex();

  return {
    ...habit,
    icon: normalizeHabitIcon((habit as Habit & { icon: Habit['icon'] | string }).icon),
    weeklyProgress: normalizedWeeklyProgress,
    completionByDate,
    completedToday: Boolean(normalizedWeeklyProgress[todayIndex]),
  };
}

function normalizePersistedTask(task: Task | (Omit<Task, 'completedToday' | 'weeklyProgress'> & { completed?: boolean })): Task {
  const legacyTask = task as Task & { completed?: boolean };
  const weeklyProgress = normalizeWeeklyProgress(
    legacyTask.weeklyProgress,
    Boolean(legacyTask.completed)
  );
  const completionByDate = normalizeCompletionByDate(
    legacyTask.completionByDate,
    weeklyProgress,
    Boolean(legacyTask.completed)
  );
  const normalizedWeeklyProgress = buildWeeklyProgressFromDateMap(completionByDate);
  const todayIndex = getCurrentMondayBasedDayIndex();

  const normalizedDateKey =
    typeof legacyTask.dateKey === 'string'
      ? legacyTask.dateKey
      : Object.keys(completionByDate)[0] ?? getTodayDateKey();

  return {
    id: task.id,
    title: task.title,
    category:
      legacyTask.category === 'must-do' || legacyTask.category === 'good-to-do' || legacyTask.category === 'wellbeing'
        ? legacyTask.category
        : 'must-do',
    dateKey: normalizedDateKey,
    completedToday: Boolean(normalizedWeeklyProgress[todayIndex]),
    weeklyProgress: normalizedWeeklyProgress,
    completionByDate,
  };
}

function normalizePersistedGoal(goal: AppState['goal'] | undefined): AppState['goal'] {
  const currentWeekStartDateKey = getCurrentWeekStartDateKey();

  if (!goal) {
    return initialState.goal;
  }

  const normalizedProgressByWeek: Record<string, number> = {};
  if (goal.progressByWeek && typeof goal.progressByWeek === 'object') {
    for (const [weekKey, value] of Object.entries(goal.progressByWeek)) {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        normalizedProgressByWeek[weekKey] = Math.max(0, Math.trunc(numericValue));
      }
    }
  }

  const currentWeekProgress = normalizedProgressByWeek[currentWeekStartDateKey];
  const fallbackProgress = Number.isFinite(goal.progress) ? Math.max(0, Math.trunc(goal.progress)) : 0;
  if (currentWeekProgress === undefined) {
    normalizedProgressByWeek[currentWeekStartDateKey] = fallbackProgress;
  }

  const normalizedTarget = Math.max(1, Math.trunc(goal.target || 1));
  const normalizedProgress = Math.min(normalizedTarget, normalizedProgressByWeek[currentWeekStartDateKey]);
  normalizedProgressByWeek[currentWeekStartDateKey] = normalizedProgress;

  return {
    ...initialState.goal,
    ...goal,
    target: normalizedTarget,
    progress: normalizedProgress,
    progressByWeek: normalizedProgressByWeek,
  };
}

export function mergePersistedAppState(persisted: Partial<AppState>): AppState {
  const currentWeekStartDateKey = getCurrentWeekStartDateKey();
  const normalizedWeeklyPlansByWeek: WeeklyPlansByWeek = {
    ...initialState.weeklyPlansByWeek,
  };
  const persistedWeeklyPlansByWeek = (persisted as Partial<AppState> & { weeklyPlansByWeek?: unknown }).weeklyPlansByWeek;
  if (persistedWeeklyPlansByWeek && typeof persistedWeeklyPlansByWeek === 'object' && !Array.isArray(persistedWeeklyPlansByWeek)) {
    for (const [weekKey, value] of Object.entries(persistedWeeklyPlansByWeek as Record<string, unknown>)) {
      normalizedWeeklyPlansByWeek[weekKey] = normalizeWeeklyPlanEntry(value);
    }
  }

  const legacyWeeklyPlan = (persisted as Partial<AppState> & {
    weeklyPlan?: Partial<WeeklyPlan> & { weekStartDateKey?: string };
  }).weeklyPlan;
  if (legacyWeeklyPlan) {
    const legacyWeekKey =
      typeof legacyWeeklyPlan.weekStartDateKey === 'string' && legacyWeeklyPlan.weekStartDateKey
        ? legacyWeeklyPlan.weekStartDateKey
        : currentWeekStartDateKey;
    normalizedWeeklyPlansByWeek[legacyWeekKey] = normalizeWeeklyPlanEntry(legacyWeeklyPlan);
  }

  if (!normalizedWeeklyPlansByWeek[currentWeekStartDateKey]) {
    normalizedWeeklyPlansByWeek[currentWeekStartDateKey] = normalizeWeeklyPlanEntry(undefined);
  }

  return {
    ...initialState,
    ...persisted,
    hasCompletedOnboarding:
      typeof persisted.hasCompletedOnboarding === 'boolean'
        ? persisted.hasCompletedOnboarding
        : initialState.hasCompletedOnboarding,
    user: {
      ...initialState.user,
      ...(persisted.user ?? {}),
    },
    preferences: persisted.preferences ?? initialState.preferences,
    habits: Array.isArray(persisted.habits)
      ? persisted.habits.map((habit) => normalizePersistedHabit(habit))
      : initialState.habits,
    goal: normalizePersistedGoal(persisted.goal),
    tasks: Array.isArray(persisted.tasks)
      ? persisted.tasks.map((task) => normalizePersistedTask(task))
      : initialState.tasks,
    reflectionDraft: persisted.reflectionDraft ?? initialState.reflectionDraft,
    reflectionHistory: Array.isArray(persisted.reflectionHistory)
      ? persisted.reflectionHistory
      : initialState.reflectionHistory,
    weeklyPlansByWeek: normalizedWeeklyPlansByWeek,
  };
}

export function appReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'TOGGLE_HABIT': {
      const updatedHabits = state.habits.map((habit) => {
        if (habit.id !== action.habitId) {
          return habit;
        }

        const completionByDate = { ...habit.completionByDate };
        const isCompleted = !Boolean(completionByDate[action.dateKey]);
        const todayIndex = getCurrentMondayBasedDayIndex();
        completionByDate[action.dateKey] = isCompleted;
        const weeklyProgress = buildWeeklyProgressFromDateMap(completionByDate);

        return {
          ...habit,
          completedToday: Boolean(weeklyProgress[todayIndex]),
          weeklyProgress,
          completionByDate,
        };
      });

      return {
        ...state,
        habits: updatedHabits,
      };
    }

    case 'ADD_HABIT':
      return {
        ...state,
        habits: [action.habit, ...state.habits],
      };

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.habitId
            ? {
                ...habit,
                title: action.title.trim() || habit.title,
                subtitle: action.subtitle.trim() || habit.subtitle,
                icon: action.icon,
              }
            : habit
        ),
      };

    case 'REMOVE_HABIT':
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.habitId),
      };

    case 'TOGGLE_TASK': {
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== action.taskId) {
          return task;
        }

        const completionByDate = { ...task.completionByDate };
        const todayIndex = getCurrentMondayBasedDayIndex();
        const isCompleted = !Boolean(completionByDate[action.dateKey]);
        completionByDate[action.dateKey] = isCompleted;
        const weeklyProgress = buildWeeklyProgressFromDateMap(completionByDate);

        return {
          ...task,
          completedToday: Boolean(weeklyProgress[todayIndex]),
          weeklyProgress,
          completionByDate,
        };
      });

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
      };

    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.taskId),
      };

    case 'MOVE_TASK_TO_DATE':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId
            ? {
                ...task,
                dateKey: action.dateKey,
              }
            : task
        ),
      };

    case 'INCREMENT_GOAL_PROGRESS': {
      const weekStartDateKey = getCurrentWeekStartDateKey();
      const currentProgress = state.goal.progressByWeek[weekStartDateKey] ?? state.goal.progress;
      const nextProgress = Math.min(state.goal.target, currentProgress + 1);
      return {
        ...state,
        goal: {
          ...state.goal,
          progress: nextProgress,
          progressByWeek: {
            ...state.goal.progressByWeek,
            [weekStartDateKey]: nextProgress,
          },
        },
      };
    }

    case 'DECREMENT_GOAL_PROGRESS': {
      const weekStartDateKey = getCurrentWeekStartDateKey();
      const currentProgress = state.goal.progressByWeek[weekStartDateKey] ?? state.goal.progress;
      const nextProgress = Math.max(0, currentProgress - 1);
      return {
        ...state,
        goal: {
          ...state.goal,
          progress: nextProgress,
          progressByWeek: {
            ...state.goal.progressByWeek,
            [weekStartDateKey]: nextProgress,
          },
        },
      };
    }

    case 'UPDATE_GOAL': {
      const weekStartDateKey = getCurrentWeekStartDateKey();
      const normalizedTarget = Math.max(1, Math.trunc(action.target || 1));
      const currentProgress = state.goal.progressByWeek[weekStartDateKey] ?? state.goal.progress;
      const nextProgress = Math.min(currentProgress, normalizedTarget);
      return {
        ...state,
        goal: {
          ...state.goal,
          title: action.title.trim() || state.goal.title,
          target: normalizedTarget,
          progress: nextProgress,
          progressByWeek: {
            ...state.goal.progressByWeek,
            [weekStartDateKey]: nextProgress,
          },
        },
      };
    }

    case 'SET_MOOD':
      return {
        ...state,
        reflectionDraft: {
          ...state.reflectionDraft,
          mood: action.mood,
        },
      };

    case 'SET_REFLECTION_FIELD':
      return {
        ...state,
        reflectionDraft: {
          ...state.reflectionDraft,
          [action.field]: action.value,
        },
      };

    case 'SAVE_REFLECTION':
      return {
        ...state,
        reflectionHistory: [action.historyItem, ...state.reflectionHistory],
        reflectionDraft: action.clearDraft
          ? {
              mood: null,
              wentWell: '',
              gratefulFor: '',
            }
          : state.reflectionDraft,
      };

    case 'UPDATE_REFLECTION':
      return {
        ...state,
        reflectionHistory: state.reflectionHistory.map((entry) =>
          entry.id === action.reflectionId
            ? {
                ...entry,
                ...action.changes,
              }
            : entry
        ),
      };

    case 'REMOVE_REFLECTION':
      return {
        ...state,
        reflectionHistory: state.reflectionHistory.filter((entry) => entry.id !== action.reflectionId),
      };

    case 'SAVE_WEEKLY_PLAN':
      return {
        ...state,
        weeklyPlansByWeek: {
          ...state.weeklyPlansByWeek,
          [action.weekStartDateKey]: {
            beforeYouBegin: action.beforeYouBegin,
            pace: action.pace,
            protectedHabitIds: action.protectedHabitIds,
          },
        },
      };

    case 'HYDRATE_STATE':
      return action.state;

    case 'RESET_STATE':
      return getEmptyAppState();

    case 'RESTORE_MOCK_DATA':
      return getInitialAppState();

    case 'TOGGLE_DARK_MODE_SESSION':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          darkMode: !state.preferences.darkMode,
        },
      };

    default:
      return state;
  }
}
function normalizeWeeklyPlanEntry(input: unknown): WeeklyPlan {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<WeeklyPlan>;
  return {
    beforeYouBegin: typeof raw.beforeYouBegin === 'string' ? raw.beforeYouBegin : '',
    pace: typeof raw.pace === 'string' && raw.pace.trim() ? raw.pace : 'Balanced',
    protectedHabitIds: Array.isArray(raw.protectedHabitIds)
      ? raw.protectedHabitIds.filter((value): value is string => typeof value === 'string')
      : [],
  };
}
