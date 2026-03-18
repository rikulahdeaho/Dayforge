import { AppState } from './appState.types';
import { getCurrentMondayBasedDayIndex, getDateKeyForMondayBasedDayIndex, getTodayDateKey } from './appState.helpers';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function selectFirstName(state: AppState) {
  return state.user.name.split(' ')[0] ?? state.user.name;
}

export function selectTotalHabitsCount(state: AppState) {
  return state.habits.length;
}

export function selectCompletedHabitsCount(state: AppState) {
  const todayDateKey = getTodayDateKey();
  return state.habits.filter((habit) => Boolean(habit.completionByDate[todayDateKey])).length;
}

export function selectTotalTasksCount(state: AppState) {
  const todayDateKey = getTodayDateKey();
  return state.tasks.filter((task) => task.dateKey === todayDateKey).length;
}

export function selectCompletedTasksCount(state: AppState, dayIndex = getCurrentMondayBasedDayIndex()) {
  const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
  return state.tasks.filter((task) => task.dateKey === dateKey && Boolean(task.completionByDate[dateKey])).length;
}

export function selectRemainingTasksCount(state: AppState, dayIndex = getCurrentMondayBasedDayIndex()) {
  const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
  const totalForDay = state.tasks.filter((task) => task.dateKey === dateKey).length;
  return totalForDay - selectCompletedTasksCount(state, dayIndex);
}

export function selectHabitProgress(state: AppState) {
  return state.habits.length ? selectCompletedHabitsCount(state) / state.habits.length : 0;
}

export function selectGoalProgress(state: AppState) {
  return state.goal.target > 0 ? state.goal.progress / state.goal.target : 0;
}

export function selectTaskProgress(state: AppState, dayIndex = getCurrentMondayBasedDayIndex()) {
  const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
  const totalForDay = state.tasks.filter((task) => task.dateKey === dateKey).length;
  return totalForDay ? selectCompletedTasksCount(state, dayIndex) / totalForDay : 0;
}

export function selectReflectionStreak(state: AppState) {
  return Math.min(7, state.reflectionHistory.length + (state.reflectionDraft.mood ? 1 : 0));
}

export function selectDailyHabitCounts(state: AppState) {
  return weekdayLabels.map((_, dayIndex) => {
    const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
    return state.habits.reduce((sum, habit) => sum + (habit.completionByDate[dateKey] ? 1 : 0), 0);
  });
}

export function selectDailyTaskCounts(state: AppState) {
  return weekdayLabels.map((_, dayIndex) => {
    const dateKey = getDateKeyForMondayBasedDayIndex(dayIndex);
    return state.tasks.reduce(
      (sum, task) => sum + (task.dateKey === dateKey && task.completionByDate[dateKey] ? 1 : 0),
      0
    );
  });
}

export function selectWeeklyCompletions(state: AppState) {
  const dailyHabits = selectDailyHabitCounts(state);
  const dailyTasks = selectDailyTaskCounts(state);

  return weekdayLabels.map((label, dayIndex) => ({
    id: `weekly-bar-${dayIndex}`,
    label,
    totalCompleted: dailyHabits[dayIndex] + dailyTasks[dayIndex],
  }));
}

export function selectWeeklyChart(state: AppState) {
  const weeklyCompletions = selectWeeklyCompletions(state);
  const maxCompleted = Math.max(...weeklyCompletions.map((day) => day.totalCompleted), 0);

  return weeklyCompletions.map((day) => {
    const value = maxCompleted > 0 ? Math.round((day.totalCompleted / maxCompleted) * 100) : 0;
    return {
      id: day.id,
      label: day.label,
      value,
      totalCompleted: day.totalCompleted,
    };
  });
}

export function selectWeeklyTrendDelta(state: AppState) {
  const todayIndex = getCurrentMondayBasedDayIndex();
  const weeklyCompletions = selectWeeklyCompletions(state).slice(0, todayIndex + 1);

  if (weeklyCompletions.length < 2) {
    return 0;
  }

  const splitAt = Math.max(1, Math.floor(weeklyCompletions.length / 2));
  const earlyWeek = weeklyCompletions.slice(0, splitAt);
  const lateWeek = weeklyCompletions.slice(splitAt);
  const earlyWeekAverage = earlyWeek.reduce((sum, day) => sum + day.totalCompleted, 0) / earlyWeek.length;
  const lateWeekAverage = lateWeek.length
    ? lateWeek.reduce((sum, day) => sum + day.totalCompleted, 0) / lateWeek.length
    : earlyWeekAverage;

  return Math.round(lateWeekAverage - earlyWeekAverage);
}

export function selectMostProductiveDay(state: AppState) {
  const weeklyCompletions = selectWeeklyCompletions(state);
  return weeklyCompletions.reduce(
    (best, day) => (day.totalCompleted > best.totalCompleted ? day : best),
    weeklyCompletions[0]
  );
}
