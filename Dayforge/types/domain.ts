import { PlatformIconName } from './ui';

export type Mood = 'sad' | 'neutral' | 'good' | 'happy';

export type User = {
  name: string;
  membership: string;
  avatar: string;
  personalGoals: string;
  reminders: string;
};

export type Preferences = {
  darkMode: boolean;
};

export type Habit = {
  id: string;
  title: string;
  subtitle: string;
  icon: PlatformIconName;
  completedToday: boolean;
  weeklyProgress: boolean[];
  completionByDate: Record<string, boolean>;
  statusLabel: string;
};

export type Goal = {
  id: string;
  title: string;
  label: string;
  progress: number;
  target: number;
  progressByWeek: Record<string, number>;
};

export type TaskCategory = 'must-do' | 'good-to-do' | 'wellbeing';

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  dateKey: string;
  completedToday: boolean;
  weeklyProgress: boolean[];
  completionByDate: Record<string, boolean>;
};

export type ReflectionDraft = {
  mood: Mood | null;
  wentWell: string;
  gratefulFor: string;
};

export type ReflectionHistoryItem = {
  id: string;
  dateLabel: string;
  fullDate: string;
  mood: Mood;
  preview: string;
  wentWellPrompt?: string;
  gratefulForPrompt?: string;
  wentWell?: string;
  gratefulFor?: string;
};

export type WeeklyPlan = {
  beforeYouBegin: string;
  pace: string;
  protectedHabitIds: string[];
};

export type WeeklyPlansByWeek = Record<string, WeeklyPlan>;
