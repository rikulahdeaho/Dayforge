import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppState } from './appState.types';
import { mergePersistedAppState } from './appState.reducer';

const STORAGE_KEY = '@dayforge/app-state-v1';
const STORAGE_VERSION = 1;

type PersistedAppState = {
  version: number;
  state: Partial<AppState>;
};

export async function loadPersistedAppState(): Promise<AppState | null> {
  const storedState = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return null;
  }

  const parsedState = JSON.parse(storedState) as Partial<AppState> | PersistedAppState;

  if ('version' in parsedState && 'state' in parsedState) {
    return mergePersistedAppState(parsedState.state);
  }

  return mergePersistedAppState(parsedState);
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
