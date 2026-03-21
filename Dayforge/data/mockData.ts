import {
  Goal,
  Habit,
  Mood,
  Preferences,
  ReflectionDraft,
  TaskCategory,
  ReflectionHistoryItem,
  Task,
  User,
  WeeklyPlan,
} from '../types';
import {
  getCurrentWeekStartDateKey,
  formatFullDateLabel,
  getDailyReflectionPrompts,
  getDateKeyForMondayBasedDayIndex,
  toDateKey,
} from '../store/appState.helpers';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayKey = toDateKey(today);
const currentWeekStartDateKey = getCurrentWeekStartDateKey(today);
const previousWeekStartDateKey = getCurrentWeekStartDateKey(new Date(today.getTime() - 7 * MS_PER_DAY));
const twoWeeksAgoStartDateKey = getCurrentWeekStartDateKey(new Date(today.getTime() - 14 * MS_PER_DAY));

function dateFromOffset(daysFromToday: number) {
  return new Date(today.getTime() + daysFromToday * MS_PER_DAY);
}

function dateKeyFromOffset(daysFromToday: number) {
  return toDateKey(dateFromOffset(daysFromToday));
}

function buildCompletionByOffset(offsets: number[]) {
  return offsets.reduce<Record<string, boolean>>((acc, offset) => {
    acc[dateKeyFromOffset(offset)] = true;
    return acc;
  }, {});
}

function buildWeeklyProgressFromCompletionMap(completionByDate: Record<string, boolean>) {
  return Array.from({ length: 7 }, (_, dayIndex) => Boolean(completionByDate[getDateKeyForMondayBasedDayIndex(dayIndex, today)]));
}

function buildTask({
  id,
  title,
  category,
  offset,
  completed,
}: {
  id: string;
  title: string;
  category: TaskCategory;
  offset: number;
  completed: boolean;
}): Task {
  const dateKey = dateKeyFromOffset(offset);
  const completionByDate = completed ? { [dateKey]: true } : {};
  const weeklyProgress = buildWeeklyProgressFromCompletionMap(completionByDate);

  return {
    id,
    title,
    category,
    dateKey,
    completedToday: Boolean(completionByDate[todayKey]),
    weeklyProgress,
    completionByDate,
  };
}

function buildReflectionHistoryItemFromOffset({
  id,
  daysAgo,
  mood,
  wentWell,
  gratefulFor,
}: {
  id: string;
  daysAgo: number;
  mood: Mood;
  wentWell: string;
  gratefulFor: string;
}): ReflectionHistoryItem {
  const entryDate = dateFromOffset(-daysAgo);
  const prompts = getDailyReflectionPrompts(entryDate);
  const dateLabel = entryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const fullDate = formatFullDateLabel(entryDate);
  const previewSource = wentWell.trim() || gratefulFor.trim();
  const preview = previewSource.length > 84 ? `${previewSource.slice(0, 84)}...` : previewSource;

  return {
    id,
    dateLabel,
    fullDate,
    mood,
    preview,
    wentWellPrompt: prompts.wentWellPrompt.question,
    gratefulForPrompt: prompts.gratefulForPrompt.question,
    wentWell,
    gratefulFor,
  };
}

export const DEMO_USER: User = {
  name: 'Alex Rivers',
  membership: 'Premium Member',
  avatar: 'AR',
  personalGoals: 'Build consistent focus routines, ship portfolio updates, and keep stress low.',
  reminders: 'Weekdays at 08:00 and 20:30',
};

export const DEMO_PREFERENCES: Preferences = {
  darkMode: true,
};

const meditationCompletion = buildCompletionByOffset([-13, -12, -10, -9, -7, -6, -5, -3, -2, -1, 0]);
const readingCompletion = buildCompletionByOffset([-12, -11, -9, -8, -6, -5, -3, -2]);
const hydrationCompletion = buildCompletionByOffset([-13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0]);
const walkCompletion = buildCompletionByOffset([-11, -9, -8, -6, -4, -3, -1]);

export const DEMO_HABITS: Habit[] = [
  {
    id: 'habit-meditation',
    title: 'Morning Meditation',
    subtitle: '12 minutes before work',
    icon: { ios: 'figure.mind.and.body', android: 'self_improvement', web: 'self_improvement' },
    completedToday: Boolean(meditationCompletion[todayKey]),
    weeklyProgress: buildWeeklyProgressFromCompletionMap(meditationCompletion),
    completionByDate: meditationCompletion,
    statusLabel: 'CONSISTENT',
  },
  {
    id: 'read',
    title: 'Read 20 Pages',
    subtitle: 'Evening wind-down',
    icon: { ios: 'book.fill', android: 'menu_book', web: 'menu_book' },
    completedToday: Boolean(readingCompletion[todayKey]),
    weeklyProgress: buildWeeklyProgressFromCompletionMap(readingCompletion),
    completionByDate: readingCompletion,
    statusLabel: 'ON TRACK',
  },
  {
    id: 'habit-water',
    title: 'Drink 2L Water',
    subtitle: 'Across the day',
    icon: { ios: 'drop.fill', android: 'water_drop', web: 'water_drop' },
    completedToday: Boolean(hydrationCompletion[todayKey]),
    weeklyProgress: buildWeeklyProgressFromCompletionMap(hydrationCompletion),
    completionByDate: hydrationCompletion,
    statusLabel: 'STREAKING',
  },
  {
    id: 'habit-walk',
    title: '10-Min Walk',
    subtitle: 'After lunch reset',
    icon: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
    completedToday: Boolean(walkCompletion[todayKey]),
    weeklyProgress: buildWeeklyProgressFromCompletionMap(walkCompletion),
    completionByDate: walkCompletion,
    statusLabel: 'BUILDING',
  },
];

export const DEMO_GOAL: Goal = {
  id: 'goal-1',
  title: 'Ship 2 portfolio case studies',
  label: 'Weekly Focus',
  progress: 6,
  target: 10,
  progressByWeek: {
    [twoWeeksAgoStartDateKey]: 4,
    [previousWeekStartDateKey]: 8,
    [currentWeekStartDateKey]: 6,
  },
};

export const DEMO_TASKS: Task[] = [
  buildTask({ id: 'task-1', title: 'Plan top 3 priorities', category: 'must-do', offset: -13, completed: true }),
  buildTask({ id: 'task-02', title: 'Deep work sprint (90m)', category: 'must-do', offset: -12, completed: true }),
  buildTask({ id: 'task-03', title: 'Send recruiter follow-up', category: 'good-to-do', offset: -11, completed: true }),
  buildTask({ id: 'task-04', title: 'Update portfolio hero copy', category: 'must-do', offset: -10, completed: false }),
  buildTask({ id: 'task-05', title: 'Apply to Product Designer role', category: 'must-do', offset: -9, completed: true }),
  buildTask({ id: 'task-06', title: 'Gym session', category: 'wellbeing', offset: -8, completed: true }),
  buildTask({ id: 'task-07', title: 'Review monthly budget', category: 'good-to-do', offset: -7, completed: false }),
  buildTask({ id: 'task-08', title: 'Refactor case study visuals', category: 'must-do', offset: -6, completed: true }),
  buildTask({ id: 'task-09', title: 'Message design mentor', category: 'good-to-do', offset: -5, completed: true }),
  buildTask({ id: 'task-10', title: 'Weekly planning for next sprint', category: 'must-do', offset: -4, completed: false }),
  buildTask({ id: 'task-11', title: 'Write reflection notes', category: 'wellbeing', offset: -3, completed: true }),
  buildTask({ id: 'task-12', title: 'Prepare interview stories', category: 'must-do', offset: -2, completed: true }),
  buildTask({ id: 'task-13', title: 'Organize file system', category: 'good-to-do', offset: -1, completed: true }),
  buildTask({ id: 'task-14', title: 'Send proposal email', category: 'must-do', offset: 0, completed: false }),
  buildTask({ id: 'task-15', title: 'Polish mobile layout details', category: 'good-to-do', offset: 0, completed: true }),
  buildTask({ id: 'task-16', title: 'Draft LinkedIn post', category: 'good-to-do', offset: 1, completed: false }),
  buildTask({ id: 'task-17', title: 'Research company shortlist', category: 'must-do', offset: 2, completed: false }),
  buildTask({ id: 'task-18', title: 'Prepare weekly review', category: 'wellbeing', offset: 3, completed: false }),
];

export const DEMO_REFLECTION_DRAFT: ReflectionDraft = {
  mood: null,
  wentWell: '',
  gratefulFor: '',
};

export const DEMO_WEEKLY_PLAN: WeeklyPlan = {
  weekStartDateKey: currentWeekStartDateKey,
  beforeYouBegin: 'Protect 2 x 90min deep work blocks before meetings.',
  pace: 'Balanced',
  protectedHabitIds: ['habit-meditation'],
};

export const DEMO_REFLECTION_HISTORY: ReflectionHistoryItem[] = [
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-01',
    daysAgo: 1,
    mood: 'happy',
    wentWell: 'Finished a deep work block and wrapped two pending tasks before noon.',
    gratefulFor: 'Supportive feedback from a friend and steady focus.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-02',
    daysAgo: 2,
    mood: 'good',
    wentWell: 'Cleaned up project structure and reduced visual bugs in the dashboard.',
    gratefulFor: 'A calm evening walk and good sleep.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-03',
    daysAgo: 3,
    mood: 'neutral',
    wentWell: 'Managed meetings well even though the day was fragmented.',
    gratefulFor: 'Having clear priorities written down.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-04',
    daysAgo: 4,
    mood: 'good',
    wentWell: 'Shipped a meaningful improvement to onboarding and task interactions.',
    gratefulFor: 'Productive momentum and healthy meals.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-05',
    daysAgo: 5,
    mood: 'happy',
    wentWell: 'Closed the week with strong output and no context switching fatigue.',
    gratefulFor: 'Time with family and a low-stress evening.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-06',
    daysAgo: 6,
    mood: 'good',
    wentWell: 'Completed admin tasks early and protected focused time for design work.',
    gratefulFor: 'Good coffee and meaningful progress.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-07',
    daysAgo: 7,
    mood: 'neutral',
    wentWell: 'Recovered from a slow start and still got key tasks done.',
    gratefulFor: 'Patience and a supportive routine.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-08',
    daysAgo: 8,
    mood: 'good',
    wentWell: 'Made a clean weekly plan and followed it better than last week.',
    gratefulFor: 'Healthy body and steady energy.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-09',
    daysAgo: 9,
    mood: 'sad',
    wentWell: 'Even with lower energy, I finished one difficult task.',
    gratefulFor: 'Rest and the ability to reset tomorrow.',
  }),
  buildReflectionHistoryItemFromOffset({
    id: 'reflection-10',
    daysAgo: 10,
    mood: 'good',
    wentWell: 'Got positive response on portfolio update and improved confidence.',
    gratefulFor: 'Learning opportunities and constructive feedback.',
  }),
];

export const DEMO_SCHEDULE = Array.from({ length: 7 }, (_, dayIndex) => {
  const date = dateFromOffset(dayIndex - 3);
  const day = date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
  const dateLabel = String(date.getDate()).padStart(2, '0');

  return {
    id: `day-${dayIndex}`,
    day,
    date: dateLabel,
  };
});
