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

import { Habit, Mood, Task } from '../types';

import { loadPersistedAppState, persistAppState } from './appState.persistence';
import {
  buildReflectionHistoryItem,
  createEntityId,
  getCurrentMondayBasedDayIndex,
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
  addHabit: (habitInput: { title: string; subtitle: string; icon: string }) => void;
  removeHabit: (habitId: string) => void;
  toggleTask: (taskId: string, dayIndex?: number) => void;
  addTask: (title: string, dayIndex?: number) => void;
  removeTask: (taskId: string) => void;
  incrementGoalProgress: () => void;
  decrementGoalProgress: () => void;
  updateGoal: (input: { title: string; target: number }) => void;
  setMood: (mood: Mood) => void;
  setReflectionField: (field: 'wentWell' | 'gratefulFor', value: string) => void;
  saveReflection: () => { ok: true } | { ok: false; reason: 'mood-required' };
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

  const buildTaskFromTitle = (title: string): Task => ({
    id: createEntityId('task'),
    title,
    dateKey: getDateKeyForMondayBasedDayIndex(getCurrentMondayBasedDayIndex()),
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
  });

  const habitIcons = ['figure.mind.and.body', 'book.fill', 'drop.fill', 'dumbbell.fill', 'moon.stars.fill', 'heart.fill'];

  const buildHabitFromTitle = (title: string, index: number): Habit => ({
    id: createEntityId('habit'),
    title,
    subtitle: 'Daily routine',
    icon: habitIcons[index % habitIcons.length],
    completedToday: false,
    weeklyProgress: [false, false, false, false, false, false, false],
    completionByDate: {},
    statusLabel: 'GETTING STARTED',
  });

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
        dispatch({
          type: 'TOGGLE_HABIT',
          habitId,
          dayIndex,
          dateKey: getDateKeyForMondayBasedDayIndex(dayIndex),
        });
      },
      addHabit: ({ title, subtitle, icon }) => {
        const normalizedTitle = title.trim();
        const normalizedSubtitle = subtitle.trim();
        const nextHabitNumber = state.habits.length + 1;
        dispatch({
          type: 'ADD_HABIT',
          habit: {
            id: createEntityId('habit'),
            title: normalizedTitle || 'New Habit',
            subtitle: normalizedSubtitle || 'Daily routine',
            icon,
            completedToday: false,
            weeklyProgress: [false, false, false, false, false, false, false],
            completionByDate: {},
            statusLabel: 'GETTING STARTED',
          },
        });
        setSuccessMessage(`Added habit #${nextHabitNumber} for this session.`);
      },
      removeHabit: (habitId) => {
        dispatch({ type: 'REMOVE_HABIT', habitId });
      },
      toggleTask: (taskId, dayIndex = getCurrentMondayBasedDayIndex()) => {
        dispatch({
          type: 'TOGGLE_TASK',
          taskId,
          dayIndex,
          dateKey: getDateKeyForMondayBasedDayIndex(dayIndex),
        });
      },
      addTask: (title, dayIndex = getCurrentMondayBasedDayIndex()) => {
        const normalizedTitle = title.trim();
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: createEntityId('task'),
            title: normalizedTitle || 'New task',
            dateKey: getDateKeyForMondayBasedDayIndex(dayIndex),
            completedToday: false,
            weeklyProgress: [false, false, false, false, false, false, false],
            completionByDate: {},
          },
        });
      },
      removeTask: (taskId) => {
        dispatch({ type: 'REMOVE_TASK', taskId });
      },
      incrementGoalProgress: () => {
        dispatch({ type: 'INCREMENT_GOAL_PROGRESS' });
      },
      decrementGoalProgress: () => {
        dispatch({ type: 'DECREMENT_GOAL_PROGRESS' });
      },
      updateGoal: ({ title, target }) => {
        dispatch({ type: 'UPDATE_GOAL', title, target });
      },
      setMood: (mood) => {
        dispatch({ type: 'SET_MOOD', mood });
      },
      setReflectionField: (field, value) => {
        dispatch({ type: 'SET_REFLECTION_FIELD', field, value });
      },
      saveReflection: () => {
        const { mood } = state.reflectionDraft;

        if (!mood) {
          return { ok: false, reason: 'mood-required' as const };
        }

        dispatch({
          type: 'SAVE_REFLECTION',
          historyItem: buildReflectionHistoryItem({ draft: state.reflectionDraft }),
          clearDraft: true,
        });

        setSuccessMessage('Reflection saved for this session.');
        return { ok: true };
      },
      toggleDarkModeSession: () => {
        dispatch({ type: 'TOGGLE_DARK_MODE_SESSION' });
      },
      completeOnboarding: (input) => {
        const normalizedName = input.name.trim() || 'New User';
        const initials = normalizedName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? '')
          .join('') || 'NU';
        const normalizedTasks = input.tasks.map((task) => task.trim()).filter(Boolean);
        const normalizedHabits = input.habits.map((habit) => habit.trim()).filter(Boolean);
        const nextState: AppState = {
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
          },
          tasks: (normalizedTasks.length ? normalizedTasks : ['First task placeholder']).map(buildTaskFromTitle),
          habits: (normalizedHabits.length ? normalizedHabits : ['First habit placeholder']).map(buildHabitFromTitle),
        };
        dispatch({ type: 'HYDRATE_STATE', state: nextState });
      },
      skipOnboarding: () => {
        const emptyState = getEmptyAppState();
        dispatch({
          type: 'HYDRATE_STATE',
          state: {
            ...emptyState,
            hasCompletedOnboarding: true,
            tasks: [buildTaskFromTitle('First task placeholder')],
            habits: [buildHabitFromTitle('First habit placeholder', 0)],
          },
        });
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
