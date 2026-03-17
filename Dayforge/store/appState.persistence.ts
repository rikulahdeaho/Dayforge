import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppState } from './appState.types';
import { mergePersistedAppState } from './appState.reducer';

const STORAGE_KEY = '@dayforge/app-state-v1';
const STORAGE_VERSION = 2;

type PersistedAppState = {
  version: number;
  state: Partial<AppState>;
};

type LegacyUserV1 = AppState['user'] & {
  darkMode?: boolean;
};

type LegacyAppStateV1 = Omit<AppState, 'preferences'> & {
  user?: LegacyUserV1;
  selectedScheduleDay?: number;
  selectedHabitDayIndex?: number;
};

function migrateToCurrentState(rawState: Partial<AppState> | LegacyAppStateV1): AppState {
  const legacyState = rawState as LegacyAppStateV1;
  const currentState = rawState as Partial<AppState>;
  const migratedState: Partial<AppState> = {
    ...legacyState,
    preferences: {
      darkMode: currentState.preferences?.darkMode ?? legacyState.user?.darkMode ?? true,
    },
    user: legacyState.user
      ? {
          name: legacyState.user.name,
          membership: legacyState.user.membership,
          avatar: legacyState.user.avatar,
        }
      : undefined,
  };

  return mergePersistedAppState(migratedState);
}

export async function loadPersistedAppState(): Promise<AppState | null> {
  const storedState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  const parsedState = JSON.parse(storedState) as Partial<AppState> | PersistedAppState;

  if ('version' in parsedState && 'state' in parsedState) {
    if (parsedState.version >= STORAGE_VERSION) {
      return mergePersistedAppState(parsedState.state);
    }

    return migrateToCurrentState(parsedState.state as LegacyAppStateV1);
  }

  return migrateToCurrentState(parsedState as LegacyAppStateV1);
}

export async function persistAppState(state: AppState): Promise<void> {
  const payload: PersistedAppState = {
    version: STORAGE_VERSION,
    state,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearPersistedAppState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
