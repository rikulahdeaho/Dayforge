import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import { Mood, PlatformIconName, TaskCategory } from '../types';

import { createHabit } from './actions/habitActions';
import { buildCompletedOnboardingState, buildSkippedOnboardingState } from './actions/onboardingActions';
import { saveReflectionDraft } from './actions/reflectionActions';
import { createTask, formatTaskDayLabel } from './actions/taskActions';
import { getGoalTargetSuccessMessage } from './actions/weeklyPlanActions';
import { loadPersistedAppState, persistAppState } from './appState.persistence';
import {
  getCurrentMondayBasedDayIndex,
  getCurrentWeekStartDateKey,
  getDateKeyForMondayBasedDayIndex,
} from './appState.helpers';
import { appReducer, getEmptyAppState, getInitialAppState } from './appState.reducer';
import { AppState } from './appState.types';

type AppStateContextValue = {
  state: AppState;
  isHydrated: boolean;
  successMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
  toggleHabit: (habitId: string, dayIndex: number) => void;
  addHabit: (habitInput: { title: string; subtitle: string; icon: PlatformIconName }) => void;
  updateHabit: (habitInput: { habitId: string; title: string; subtitle: string; icon: PlatformIconName }) => void;
  removeHabit: (habitId: string) => void;
  toggleTask: (taskId: string, dayIndex?: number) => void;
  addTask: (input: { title: string; dayIndex?: number; category: TaskCategory }) => void;
  removeTask: (taskId: string) => void;
  moveTaskToDate: (input: { taskId: string; dateKey: string }) => void;
  incrementGoalProgress: () => void;
  decrementGoalProgress: () => void;
  updateGoal: (input: { title: string; target: number }) => void;
  setMood: (mood: Mood) => void;
  setReflectionField: (field: 'wentWell' | 'gratefulFor', value: string) => void;
  saveReflection: () => { ok: true; streakDays: number } | { ok: false; reason: 'mood-required' | 'entry-required' };
  updateReflection: (input: { reflectionId: string; wentWell: string; gratefulFor: string }) => void;
  removeReflection: (reflectionId: string) => void;
  saveWeeklyPlan: (input: { weekStartDateKey: string; beforeYouBegin: string; pace: string; protectedHabitIds: string[] }) => void;
  toggleDarkModeSession: () => void;
  completeOnboarding: (input: OnboardingInput) => void;
  skipOnboarding: () => void;
  resetAppData: () => Promise<void>;
  loadMockData: () => Promise<void>;
};

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

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getEmptyAppState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const isStorageUnavailableRef = useRef(false);
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disableStorageWithWarning = (phase: 'hydrate' | 'persist' | 'reset', error: unknown) => {
    if (isStorageUnavailableRef.current) {
      return;
    }

    isStorageUnavailableRef.current = true;
    console.warn(
      `AsyncStorage unavailable during ${phase}; data will be session-only until app restart.`,
      error
    );
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateState = async () => {
      if (isStorageUnavailableRef.current) {
        if (isMounted) {
          setIsHydrated(true);
        }
        return;
      }

      try {
        const persistedState = await loadPersistedAppState();

        if (persistedState) {
          dispatch({ type: 'HYDRATE_STATE', state: persistedState });
        }
      } catch (error) {
        disableStorageWithWarning('hydrate', error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || isStorageUnavailableRef.current) {
      return;
    }

    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      const persistState = async () => {
        try {
          await persistAppState(state);
        } catch (error) {
          disableStorageWithWarning('persist', error);
        }
      };
      void persistState();
    }, 250);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [state, isHydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      isHydrated,
      successMessage,
      setSuccessMessage,
      toggleHabit: (habitId, dayIndex) => {
        const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
        const habitsForDay = state.habits;
        const habit = habitsForDay.find((item) => item.id === habitId);
        const wasCompleted = Boolean(habit?.completionByDate[dateKey]);
        dispatch({
          type: 'TOGGLE_HABIT',
          habitId,
          dayIndex,
          dateKey,
        });

        if (!habit || wasCompleted || habitsForDay.length === 0) {
          return;
        }

        const completedAfter = habitsForDay.filter((item) => Boolean(item.completionByDate[dateKey])).length + 1;
        if (completedAfter === habitsForDay.length) {
          setSuccessMessage(`All habits done for ${formatTaskDayLabel(dayIndex)}.`);
        }
      },
      addHabit: ({ title, subtitle, icon }) => {
        const nextHabitNumber = state.habits.length + 1;
        dispatch({
          type: 'ADD_HABIT',
          habit: createHabit({ title, subtitle, icon }),
        });
        setSuccessMessage(`Added habit #${nextHabitNumber} for this session.`);
      },
      updateHabit: ({ habitId, title, subtitle, icon }) => {
        dispatch({
          type: 'UPDATE_HABIT',
          habitId,
          title,
          subtitle,
          icon,
        });
        setSuccessMessage('Habit updated for this session.');
      },
      removeHabit: (habitId) => {
        dispatch({ type: 'REMOVE_HABIT', habitId });
        setSuccessMessage('Habit removed.');
      },
      toggleTask: (taskId, dayIndex = getCurrentMondayBasedDayIndex()) => {
        const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
        const tasksForDay = state.tasks.filter((task) => task.dateKey === dateKey);
        const targetTask = tasksForDay.find((task) => task.id === taskId);
        const wasCompleted = Boolean(targetTask?.completionByDate[dateKey]);
        dispatch({
          type: 'TOGGLE_TASK',
          taskId,
          dayIndex,
          dateKey,
        });

        if (!targetTask || wasCompleted || tasksForDay.length === 0) {
          return;
        }

        const completedAfter = tasksForDay.filter((task) => Boolean(task.completionByDate[dateKey])).length + 1;
        if (completedAfter === tasksForDay.length) {
          setSuccessMessage(`All tasks done for ${formatTaskDayLabel(dayIndex)}.`);
        }
      },
      addTask: ({ title, dayIndex = getCurrentMondayBasedDayIndex(), category }) => {
        dispatch({
          type: 'ADD_TASK',
          task: createTask({ title, dayIndex, category }),
        });
        setSuccessMessage(`Task added for ${formatTaskDayLabel(dayIndex)}.`);
      },
      removeTask: (taskId) => {
        dispatch({ type: 'REMOVE_TASK', taskId });
        setSuccessMessage('Task removed.');
      },
      moveTaskToDate: ({ taskId, dateKey }) => {
        dispatch({ type: 'MOVE_TASK_TO_DATE', taskId, dateKey });
        setSuccessMessage('Task moved.');
      },
      incrementGoalProgress: () => {
        const currentWeekStartDateKey = getCurrentWeekStartDateKey();
        const currentProgress = state.goal.progressByWeek[currentWeekStartDateKey] ?? state.goal.progress;
        const nextValue = Math.min(state.goal.target, currentProgress + 1);
        dispatch({ type: 'INCREMENT_GOAL_PROGRESS' });
        if (nextValue >= state.goal.target) {
          setSuccessMessage('Weekly focus completed.');
        }
      },
      decrementGoalProgress: () => {
        dispatch({ type: 'DECREMENT_GOAL_PROGRESS' });
      },
      updateGoal: ({ title, target }) => {
        const currentWeekStartDateKey = getCurrentWeekStartDateKey();
        const currentProgress = state.goal.progressByWeek[currentWeekStartDateKey] ?? state.goal.progress;
        const normalizedTarget = Math.max(1, Math.trunc(target || 1));
        dispatch({ type: 'UPDATE_GOAL', title, target });
        setSuccessMessage(getGoalTargetSuccessMessage(currentProgress, normalizedTarget));
      },
      setMood: (mood) => {
        dispatch({ type: 'SET_MOOD', mood });
      },
      setReflectionField: (field, value) => {
        dispatch({ type: 'SET_REFLECTION_FIELD', field, value });
      },
      saveReflection: () => {
        const result = saveReflectionDraft(state);
        if (!result.ok) {
          return result;
        }
        dispatch({
          type: 'SAVE_REFLECTION',
          historyItem: result.historyItem,
          clearDraft: true,
        });
        setSuccessMessage(result.successMessage);
        return { ok: true as const, streakDays: result.streakDays };
      },
      updateReflection: ({ reflectionId, wentWell, gratefulFor }) => {
        const normalizedWentWell = wentWell.trim();
        const normalizedGratefulFor = gratefulFor.trim();
        const fallbackPreview = 'A calm and focused day with steady progress.';
        const previewSource = normalizedWentWell || normalizedGratefulFor || fallbackPreview;
        const preview = previewSource.length > 84 ? `${previewSource.slice(0, 84)}...` : previewSource;

        dispatch({
          type: 'UPDATE_REFLECTION',
          reflectionId,
          changes: {
            wentWell,
            gratefulFor,
            preview,
          },
        });
        setSuccessMessage('Reflection updated.');
      },
      removeReflection: (reflectionId) => {
        dispatch({ type: 'REMOVE_REFLECTION', reflectionId });
        setSuccessMessage('Reflection deleted.');
      },
      saveWeeklyPlan: ({ weekStartDateKey, beforeYouBegin, pace, protectedHabitIds }) => {
        dispatch({
          type: 'SAVE_WEEKLY_PLAN',
          weekStartDateKey,
          beforeYouBegin: beforeYouBegin.trim(),
          pace,
          protectedHabitIds,
        });
        setSuccessMessage('Weekly plan saved.');
      },
      toggleDarkModeSession: () => {
        dispatch({ type: 'TOGGLE_DARK_MODE_SESSION' });
      },
      completeOnboarding: (input) => {
        dispatch({ type: 'HYDRATE_STATE', state: buildCompletedOnboardingState(input) });
      },
      skipOnboarding: () => {
        dispatch({ type: 'HYDRATE_STATE', state: buildSkippedOnboardingState() });
      },
      resetAppData: async () => {
        const emptyState = getEmptyAppState();

        if (isStorageUnavailableRef.current) {
          dispatch({ type: 'HYDRATE_STATE', state: emptyState });
          setSuccessMessage('All app data has been cleared.');
          return;
        }

        try {
          await persistAppState(emptyState);
        } catch (error) {
          disableStorageWithWarning('reset', error);
        } finally {
          dispatch({ type: 'HYDRATE_STATE', state: emptyState });
          setSuccessMessage('All app data has been cleared.');
        }
      },
      loadMockData: async () => {
        const mockState = getInitialAppState();

        if (isStorageUnavailableRef.current) {
          dispatch({ type: 'HYDRATE_STATE', state: mockState });
          setSuccessMessage('Mock data loaded.');
          return;
        }

        try {
          await persistAppState(mockState);
        } catch (error) {
          disableStorageWithWarning('persist', error);
        } finally {
          dispatch({ type: 'HYDRATE_STATE', state: mockState });
          setSuccessMessage('Mock data loaded.');
        }
      },
    }),
    [isHydrated, state, successMessage]
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
