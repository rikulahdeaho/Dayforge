import {
  DEMO_GOAL,
  DEMO_HABITS,
  DEMO_PREFERENCES,
  DEMO_REFLECTION_DRAFT,
  DEMO_REFLECTION_HISTORY,
  DEMO_TASKS,
  DEMO_USER,
} from '../data/mockData';
import { Habit, PlatformIconName, Task } from '../types';

import { AppState, AppStateAction } from './appState.types';
import {
  getCurrentMondayBasedDayIndex,
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
    },
    tasks: [],
    reflectionDraft: {
      mood: null,
      wentWell: '',
      gratefulFor: '',
    },
    reflectionHistory: [],
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
    dateKey: normalizedDateKey,
    completedToday: Boolean(normalizedWeeklyProgress[todayIndex]),
    weeklyProgress: normalizedWeeklyProgress,
    completionByDate,
  };
}

export function mergePersistedAppState(persisted: Partial<AppState>): AppState {
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
    goal: persisted.goal ?? initialState.goal,
    tasks: Array.isArray(persisted.tasks)
      ? persisted.tasks.map((task) => normalizePersistedTask(task))
      : initialState.tasks,
    reflectionDraft: persisted.reflectionDraft ?? initialState.reflectionDraft,
    reflectionHistory: Array.isArray(persisted.reflectionHistory)
      ? persisted.reflectionHistory
      : initialState.reflectionHistory,
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

    case 'INCREMENT_GOAL_PROGRESS':
      return {
        ...state,
        goal: {
          ...state.goal,
          progress: Math.min(state.goal.target, state.goal.progress + 1),
        },
      };

    case 'DECREMENT_GOAL_PROGRESS':
      return {
        ...state,
        goal: {
          ...state.goal,
          progress: Math.max(0, state.goal.progress - 1),
        },
      };

    case 'UPDATE_GOAL': {
      const normalizedTarget = Math.max(1, Math.trunc(action.target || 1));
      return {
        ...state,
        goal: {
          ...state.goal,
          title: action.title.trim() || state.goal.title,
          target: normalizedTarget,
          progress: Math.min(state.goal.progress, normalizedTarget),
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
