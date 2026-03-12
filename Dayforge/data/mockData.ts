import { Goal, Habit, ReflectionDraft, ReflectionHistoryItem, Task, User } from '@/types';

export const DEMO_USER: User = {
  name: 'Alex Rivers',
  membership: 'Premium Member',
  avatar: 'AR',
  darkMode: true,
};

export const DEMO_HABITS: Habit[] = [
  {
    id: 'meditation',
    title: 'Morning Meditation',
    subtitle: '15 mins - Morning',
    icon: 'figure.mind.and.body',
    completedToday: true,
    weeklyProgress: [true, true, true, true, true, true, true],
    statusLabel: 'PERFECT WEEK',
  },
  {
    id: 'read',
    title: 'Read 20 Pages',
    subtitle: 'Nightly habit',
    icon: 'book.fill',
    completedToday: false,
    weeklyProgress: [true, true, true, false, true, true, false],
    statusLabel: '5/7 DAYS',
  },
  {
    id: 'water',
    title: 'Drink 2L Water',
    subtitle: 'Throughout the day',
    icon: 'drop.fill',
    completedToday: true,
    weeklyProgress: [true, true, true, true, true, true, true],
    statusLabel: 'ON TRACK',
  },
];

export const DEMO_GOAL: Goal = {
  id: 'goal-1',
  title: 'Apply to 3 jobs',
  label: 'CURRENT OBJECTIVE',
  progress: 1,
  target: 3,
};

export const DEMO_TASKS: Task[] = [
  { id: 'task-1', title: 'Morning meditation (15 mins)', completed: false },
  { id: 'task-2', title: 'Drink 2L of water', completed: true },
  { id: 'task-3', title: 'Finalize portfolio case study', completed: false },
];

export const DEMO_REFLECTION_DRAFT: ReflectionDraft = {
  mood: null,
  wentWell: '',
  gratefulFor: '',
};

export const DEMO_REFLECTION_HISTORY: ReflectionHistoryItem[] = [
  {
    id: 'history-1',
    dateLabel: 'Yesterday',
    mood: 'happy',
    preview: 'Had an amazing dinner with friends and disconnected from work stress.',
    wentWell: 'Wrapped up my tasks before dinner and stayed present.',
    gratefulFor: 'Great friends and meaningful conversations.',
  },
  {
    id: 'history-2',
    dateLabel: 'Oct 21',
    mood: 'good',
    preview: 'Finally finished reading that book and took notes for future ideas.',
    wentWell: 'Read for 30 focused minutes before sleep.',
    gratefulFor: 'Quiet evening and mental clarity.',
  },
  {
    id: 'history-3',
    dateLabel: 'Oct 20',
    mood: 'neutral',
    preview: 'A productive but very busy Friday with little downtime.',
    wentWell: 'Completed most urgent tasks by noon.',
    gratefulFor: 'Good health and steady progress.',
  },
];

export const DEMO_SCHEDULE = [
  { id: 'mon', day: 'MON', date: '26' },
  { id: 'tue', day: 'TUE', date: '27' },
  { id: 'wed', day: 'WED', date: '28' },
  { id: 'thu', day: 'THU', date: '29' },
  { id: 'fri', day: 'FRI', date: '01' },
  { id: 'sat', day: 'SAT', date: '02' },
  { id: 'sun', day: 'SUN', date: '03' },
];
