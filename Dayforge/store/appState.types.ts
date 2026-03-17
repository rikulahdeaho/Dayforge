import { Goal, Habit, Mood, ReflectionDraft, ReflectionHistoryItem, Task, User } from '@/types';

export type AppState = {
  user: User;
  habits: Habit[];
  goal: Goal;
  tasks: Task[];
  reflectionDraft: ReflectionDraft;
  reflectionHistory: ReflectionHistoryItem[];
  selectedScheduleDay: number;
  selectedHabitDayIndex: number;
};

export type AppStateAction =
  | { type: 'TOGGLE_HABIT'; habitId: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'TOGGLE_TASK'; taskId: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'INCREMENT_GOAL_PROGRESS' }
  | { type: 'DECREMENT_GOAL_PROGRESS' }
  | { type: 'SELECT_SCHEDULE_DAY'; dayIndex: number }
  | { type: 'SELECT_HABIT_DAY'; dayIndex: number }
  | { type: 'SET_MOOD'; mood: Mood | null }
  | { type: 'SET_REFLECTION_FIELD'; field: 'wentWell' | 'gratefulFor'; value: string }
  | {
      type: 'SAVE_REFLECTION';
      historyItem: ReflectionHistoryItem;
      clearDraft: boolean;
    }
  | { type: 'HYDRATE_STATE'; state: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'TOGGLE_DARK_MODE_SESSION' };
