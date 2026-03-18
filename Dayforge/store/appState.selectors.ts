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

export function selectWeeklyChart(state: AppState) {
  const totalHabits = Math.max(1, selectTotalHabitsCount(state));
  const goalProgress = selectGoalProgress(state);
  const taskProgress = selectTaskProgress(state);

  return selectDailyHabitCounts(state).map((count, dayIndex) => {
    const habitsScore = (count / totalHabits) * 72;
    const supportScore = goalProgress * 18 + taskProgress * 10;
    const value = Math.max(10, Math.min(100, Math.round(habitsScore + supportScore)));

    return {
      id: `weekly-bar-${dayIndex}`,
      label: weekdayLabels[dayIndex],
      value,
    };
  });
}

export function selectWeeklyTrendDelta(state: AppState) {
  const weeklyChart = selectWeeklyChart(state);
  const earlyWeekAverage = (weeklyChart[0].value + weeklyChart[1].value + weeklyChart[2].value) / 3;
  const lateWeekAverage = (weeklyChart[4].value + weeklyChart[5].value + weeklyChart[6].value) / 3;

  return Math.round(lateWeekAverage - earlyWeekAverage);
}

export function selectMostProductiveDay(state: AppState) {
  const weeklyChart = selectWeeklyChart(state);
  return weeklyChart.reduce((best, day) => (day.value > best.value ? day : best), weeklyChart[0]);
}
