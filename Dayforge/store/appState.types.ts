import { Goal, Habit, Mood, Preferences, ReflectionDraft, ReflectionHistoryItem, Task, User, WeeklyPlan, WeeklyPlansByWeek } from '../types';

export type AppState = {
  hasCompletedOnboarding: boolean;
  user: User;
  preferences: Preferences;
  habits: Habit[];
  goal: Goal;
  tasks: Task[];
  reflectionDraft: ReflectionDraft;
  reflectionHistory: ReflectionHistoryItem[];
  weeklyPlansByWeek: WeeklyPlansByWeek;
};

export type AppStateAction =
  | { type: 'TOGGLE_HABIT'; habitId: string; dayIndex: number; dateKey: string }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habitId: string; title: string; subtitle: string; icon: Habit['icon'] }
  | { type: 'REMOVE_HABIT'; habitId: string }
  | { type: 'TOGGLE_TASK'; taskId: string; dayIndex: number; dateKey: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'REMOVE_TASK'; taskId: string }
  | { type: 'MOVE_TASK_TO_DATE'; taskId: string; dateKey: string }
  | { type: 'INCREMENT_GOAL_PROGRESS' }
  | { type: 'DECREMENT_GOAL_PROGRESS' }
  | { type: 'UPDATE_GOAL'; title: string; target: number }
  | { type: 'SET_MOOD'; mood: Mood | null }
  | { type: 'SET_REFLECTION_FIELD'; field: 'wentWell' | 'gratefulFor'; value: string }
  | {
      type: 'SAVE_REFLECTION';
      historyItem: ReflectionHistoryItem;
      clearDraft: boolean;
    }
  | { type: 'UPDATE_REFLECTION'; reflectionId: string; changes: Partial<Pick<ReflectionHistoryItem, 'wentWell' | 'gratefulFor' | 'preview'>> }
  | { type: 'REMOVE_REFLECTION'; reflectionId: string }
  | {
      type: 'SAVE_WEEKLY_PLAN';
      weekStartDateKey: string;
      beforeYouBegin: string;
      pace: string;
      protectedHabitIds: string[];
    }
  | { type: 'HYDRATE_STATE'; state: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'RESTORE_MOCK_DATA' }
  | { type: 'TOGGLE_DARK_MODE_SESSION' };
