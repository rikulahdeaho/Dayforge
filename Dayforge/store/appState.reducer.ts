import {
  DEMO_GOAL,
  DEMO_HABITS,
  DEMO_REFLECTION_DRAFT,
  DEMO_REFLECTION_HISTORY,
  DEMO_TASKS,
  DEMO_USER,
} from '@/data/mockData';

import { AppState, AppStateAction } from './appState.types';

const getMondayBasedDayIndex = () => (new Date().getDay() + 6) % 7;
const clampDayIndex = (value: number) => Math.max(0, Math.min(6, value));

export function getInitialAppState(): AppState {
  return {
    user: DEMO_USER,
    habits: DEMO_HABITS,
    goal: DEMO_GOAL,
    tasks: DEMO_TASKS,
    reflectionDraft: DEMO_REFLECTION_DRAFT,
    reflectionHistory: DEMO_REFLECTION_HISTORY,
    selectedScheduleDay: getMondayBasedDayIndex(),
    selectedHabitDayIndex: getMondayBasedDayIndex(),
  };
}

const initialState = getInitialAppState();

export function mergePersistedAppState(persisted: Partial<AppState>): AppState {
  return {
    ...initialState,
    ...persisted,
    user: persisted.user ?? initialState.user,
    habits: Array.isArray(persisted.habits) ? persisted.habits : initialState.habits,
    goal: persisted.goal ?? initialState.goal,
    tasks: Array.isArray(persisted.tasks) ? persisted.tasks : initialState.tasks,
    reflectionDraft: persisted.reflectionDraft ?? initialState.reflectionDraft,
    reflectionHistory: Array.isArray(persisted.reflectionHistory)
      ? persisted.reflectionHistory
      : initialState.reflectionHistory,
    selectedScheduleDay: clampDayIndex(
      typeof persisted.selectedScheduleDay === 'number'
        ? persisted.selectedScheduleDay
        : initialState.selectedScheduleDay
    ),
    selectedHabitDayIndex: clampDayIndex(
      typeof persisted.selectedHabitDayIndex === 'number'
        ? persisted.selectedHabitDayIndex
        : initialState.selectedHabitDayIndex
    ),
  };
}

export function appReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'TOGGLE_HABIT': {
      const updatedHabits = state.habits.map((habit) => {
        if (habit.id !== action.habitId) {
          return habit;
        }

        const isCompleted = !habit.completedToday;
        const progress = [...habit.weeklyProgress];
        const safeIndex = Math.max(0, Math.min(6, state.selectedHabitDayIndex));
        progress[safeIndex] = isCompleted;

        return {
          ...habit,
          completedToday: isCompleted,
          weeklyProgress: progress,
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

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, completed: !task.completed } : task
        ),
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
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

    case 'SELECT_SCHEDULE_DAY':
      return {
        ...state,
        selectedScheduleDay: action.dayIndex,
      };

    case 'SELECT_HABIT_DAY':
      return {
        ...state,
        selectedHabitDayIndex: action.dayIndex,
      };

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
      return getInitialAppState();

    case 'TOGGLE_DARK_MODE_SESSION':
      return {
        ...state,
        user: {
          ...state.user,
          darkMode: !state.user.darkMode,
        },
      };

    default:
      return state;
  }
}
