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

import { Mood } from '@/types';

import { clearPersistedAppState, loadPersistedAppState, persistAppState } from './appState.persistence';
import { appReducer, getInitialAppState } from './appState.reducer';
import { AppState } from './appState.types';

type AppStateContextValue = {
  state: AppState;
  successMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
  toggleHabit: (habitId: string) => void;
  addHabit: (habitInput: { title: string; subtitle: string; icon: string }) => void;
  toggleTask: (taskId: string) => void;
  addTask: (title: string) => void;
  incrementGoalProgress: () => void;
  decrementGoalProgress: () => void;
  selectScheduleDay: (dayIndex: number) => void;
  selectHabitDay: (dayIndex: number) => void;
  setMood: (mood: Mood) => void;
  setReflectionField: (field: 'wentWell' | 'gratefulFor', value: string) => void;
  saveReflection: () => { ok: true } | { ok: false; reason: 'mood-required' };
  toggleDarkModeSession: () => void;
  resetAppData: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialAppState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const isStorageUnavailableRef = useRef(false);

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

    const persistState = async () => {
      try {
        await persistAppState(state);
      } catch (error) {
        disableStorageWithWarning('persist', error);
      }
    };

    void persistState();
  }, [state, isHydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      successMessage,
      setSuccessMessage,
      toggleHabit: (habitId) => {
        dispatch({ type: 'TOGGLE_HABIT', habitId });
      },
      addHabit: ({ title, subtitle, icon }) => {
        const normalizedTitle = title.trim();
        const normalizedSubtitle = subtitle.trim();
        const nextHabitNumber = state.habits.length + 1;
        dispatch({
          type: 'ADD_HABIT',
          habit: {
            id: `habit-${Date.now()}`,
            title: normalizedTitle || 'New Habit',
            subtitle: normalizedSubtitle || 'Daily routine',
            icon,
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
      addTask: (title) => {
        const normalizedTitle = title.trim();
        dispatch({
          type: 'ADD_TASK',
          task: {
            id: `task-${Date.now()}`,
            title: normalizedTitle || 'New task',
            completed: false,
          },
        });
      },
      incrementGoalProgress: () => {
        dispatch({ type: 'INCREMENT_GOAL_PROGRESS' });
      },
      decrementGoalProgress: () => {
        dispatch({ type: 'DECREMENT_GOAL_PROGRESS' });
      },
      selectScheduleDay: (dayIndex) => {
        dispatch({ type: 'SELECT_SCHEDULE_DAY', dayIndex });
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
      resetAppData: async () => {
        if (isStorageUnavailableRef.current) {
          dispatch({ type: 'RESET_STATE' });
          setSuccessMessage('App data reset to defaults.');
          return;
        }

        try {
          await clearPersistedAppState();
        } catch (error) {
          disableStorageWithWarning('reset', error);
        } finally {
          dispatch({ type: 'RESET_STATE' });
          setSuccessMessage('App data reset to defaults.');
        }
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
