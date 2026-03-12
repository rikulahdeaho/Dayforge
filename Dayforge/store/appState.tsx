import React, { ReactNode, createContext, useContext, useMemo, useReducer, useState } from 'react';

import {
  DEMO_GOAL,
  DEMO_HABITS,
  DEMO_REFLECTION_DRAFT,
  DEMO_REFLECTION_HISTORY,
  DEMO_TASKS,
  DEMO_USER,
} from '@/data/mockData';
import { Goal, Habit, Mood, ReflectionDraft, ReflectionHistoryItem, Task, User } from '@/types';

type AppState = {
  user: User;
  habits: Habit[];
  goal: Goal;
  tasks: Task[];
  reflectionDraft: ReflectionDraft;
  reflectionHistory: ReflectionHistoryItem[];
  selectedScheduleDay: string;
  selectedHabitDayIndex: number;
};

type Action =
  | { type: 'TOGGLE_HABIT'; habitId: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'TOGGLE_TASK'; taskId: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'INCREMENT_GOAL_PROGRESS' }
  | { type: 'SELECT_SCHEDULE_DAY'; dayId: string }
  | { type: 'SELECT_HABIT_DAY'; dayIndex: number }
  | { type: 'SET_MOOD'; mood: Mood | null }
  | { type: 'SET_REFLECTION_FIELD'; field: 'wentWell' | 'gratefulFor'; value: string }
  | {
      type: 'SAVE_REFLECTION';
      historyItem: ReflectionHistoryItem;
      clearDraft: boolean;
    }
  | { type: 'TOGGLE_DARK_MODE_SESSION' };

const initialState: AppState = {
  user: DEMO_USER,
  habits: DEMO_HABITS,
  goal: DEMO_GOAL,
  tasks: DEMO_TASKS,
  reflectionDraft: DEMO_REFLECTION_DRAFT,
  reflectionHistory: DEMO_REFLECTION_HISTORY,
  selectedScheduleDay: 'tue',
  selectedHabitDayIndex: new Date().getDay(),
};

function appReducer(state: AppState, action: Action): AppState {
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

    case 'SELECT_SCHEDULE_DAY':
      return {
        ...state,
        selectedScheduleDay: action.dayId,
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

type AppStateContextValue = {
  state: AppState;
  successMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
  toggleHabit: (habitId: string) => void;
  addHabit: () => void;
  toggleTask: (taskId: string) => void;
  addTask: () => void;
  incrementGoalProgress: () => void;
  selectScheduleDay: (dayId: string) => void;
  selectHabitDay: (dayIndex: number) => void;
  setMood: (mood: Mood) => void;
  setReflectionField: (field: 'wentWell' | 'gratefulFor', value: string) => void;
  saveReflection: () => { ok: true } | { ok: false; reason: 'mood-required' };
  toggleDarkModeSession: () => void;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      successMessage,
      setSuccessMessage,
      toggleHabit: (habitId) => {
        dispatch({ type: 'TOGGLE_HABIT', habitId });
      },
      addHabit: () => {
        const nextHabitNumber = state.habits.length + 1;
        dispatch({
          type: 'ADD_HABIT',
          habit: {
            id: `habit-${Date.now()}`,
            title: 'New Habit',
            subtitle: 'Daily routine',
            icon: 'sparkles',
            completedToday: false,
            weeklyProgress: [false, false, false, false, false, false, false],
            statusLabel: 'GETTING STARTED',
          },
        });
        setSuccessMessage(`Added habit #${nextHabitNumber} for this session.`);
      },
      toggleTask: (taskId) => {
        dispatch({ type: 'TOGGLE_TASK', taskId });
      },
      addTask: () => {
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: `task-${Date.now()}`,
            title: 'New task',
            completed: false,
          },
        });
      },
      incrementGoalProgress: () => {
        dispatch({ type: 'INCREMENT_GOAL_PROGRESS' });
      },
      selectScheduleDay: (dayId) => {
        dispatch({ type: 'SELECT_SCHEDULE_DAY', dayId });
      },
      selectHabitDay: (dayIndex) => {
        dispatch({ type: 'SELECT_HABIT_DAY', dayIndex });
      },
      setMood: (mood) => {
        dispatch({ type: 'SET_MOOD', mood });
      },
      setReflectionField: (field, value) => {
        dispatch({ type: 'SET_REFLECTION_FIELD', field, value });
      },
      saveReflection: () => {
        const { mood, wentWell, gratefulFor } = state.reflectionDraft;

        if (!mood) {
          return { ok: false, reason: 'mood-required' as const };
        }

        const fallbackPreview = 'A calm and focused day with steady progress.';
        const previewSource = wentWell.trim() || gratefulFor.trim() || fallbackPreview;
        const preview = previewSource.length > 84 ? `${previewSource.slice(0, 84)}...` : previewSource;
        const dateLabel = new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });

        dispatch({
          type: 'SAVE_REFLECTION',
          historyItem: {
            id: `reflection-${Date.now()}`,
            dateLabel,
            mood,
            preview,
            wentWell,
            gratefulFor,
          },
          clearDraft: true,
        });

        setSuccessMessage('Reflection saved for this session.');
        return { ok: true };
      },
      toggleDarkModeSession: () => {
        dispatch({ type: 'TOGGLE_DARK_MODE_SESSION' });
      },
    }),
    [state, successMessage]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  return context;
}
