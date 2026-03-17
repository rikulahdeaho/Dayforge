import { AppState } from './appState.types';

export function selectCompletedHabitsCount(state: AppState) {
  return state.habits.filter((habit) => habit.completedToday).length;
}

export function selectCompletedTasksCount(state: AppState) {
  return state.tasks.filter((task) => task.completed).length;
}

export function selectRemainingTasksCount(state: AppState) {
  return state.tasks.filter((task) => !task.completed).length;
}

export function selectHabitProgress(state: AppState) {
  return state.habits.length ? selectCompletedHabitsCount(state) / state.habits.length : 0;
}

export function selectGoalProgress(state: AppState) {
  return state.goal.target > 0 ? state.goal.progress / state.goal.target : 0;
}
