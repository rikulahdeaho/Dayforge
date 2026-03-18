export type Mood = 'sad' | 'neutral' | 'good' | 'happy';

export type User = {
  name: string;
  membership: string;
  avatar: string;
};

export type Preferences = {
  darkMode: boolean;
};

export type Habit = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
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
};

export type Task = {
  id: string;
  title: string;
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
  wentWell?: string;
  gratefulFor?: string;
};
