import { Goal, Habit, Mood, Preferences, ReflectionDraft, ReflectionHistoryItem, Task, User } from '../types';

export type AppState = {
  user: User;
  preferences: Preferences;
  habits: Habit[];
  goal: Goal;
  tasks: Task[];
  reflectionDraft: ReflectionDraft;
  reflectionHistory: ReflectionHistoryItem[];
};

export type AppStateAction =
  | { type: 'TOGGLE_HABIT'; habitId: string; dayIndex: number; dateKey: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'TOGGLE_TASK'; taskId: string; dayIndex: number; dateKey: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'INCREMENT_GOAL_PROGRESS' }
  | { type: 'DECREMENT_GOAL_PROGRESS' }
  | { type: 'SET_MOOD'; mood: Mood | null }
  | { type: 'SET_REFLECTION_FIELD'; field: 'wentWell' | 'gratefulFor'; value: string }
  | {
      type: 'SAVE_REFLECTION';
      historyItem: ReflectionHistoryItem;
      clearDraft: boolean;
    }
  | { type: 'HYDRATE_STATE'; state: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'RESTORE_MOCK_DATA' }
  | { type: 'TOGGLE_DARK_MODE_SESSION' };
