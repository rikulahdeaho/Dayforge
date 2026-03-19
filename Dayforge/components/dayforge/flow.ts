import { formatFullDateLabel } from '@/store/appState.helpers';
import {
  selectCompletedHabitsCount,
  selectCompletedTasksCount,
  selectRemainingTasksCount,
  selectTotalHabitsCount,
  selectTotalTasksCount,
} from '@/store/appState.selectors';
import { AppState } from '@/store/appState.types';

export type FlowStep = 'tasks' | 'habits' | 'reflect' | 'summary';

type FlowCopy = {
  label: string;
  route: '/(tabs)/task' | '/(tabs)/habits' | '/(tabs)/reflect' | '/reflections';
  nextLine: string;
};

const FLOW_COPY: Record<FlowStep, FlowCopy> = {
  tasks: {
    label: 'Continue tasks',
    route: '/(tabs)/task',
    nextLine: 'Next up: tasks',
  },
  habits: {
    label: 'Continue habits',
    route: '/(tabs)/habits',
    nextLine: 'Next up: habits',
  },
  reflect: {
    label: 'Finish with reflection',
    route: '/(tabs)/reflect',
    nextLine: 'Next up: reflection',
  },
  summary: {
    label: "View today's summary",
    route: '/reflections',
    nextLine: 'Take a moment to review your progress',
  },
};

export function getFlowStep(state: AppState): FlowStep {
  const totalHabits = selectTotalHabitsCount(state);
  const completedHabits = selectCompletedHabitsCount(state);
  const habitsLeft = Math.max(0, totalHabits - completedHabits);
  const habitsDone = totalHabits === 0 || habitsLeft === 0;

  const remainingTasks = selectRemainingTasksCount(state);
  const tasksDone = remainingTasks === 0;

  const todayFullDate = formatFullDateLabel(new Date());
  const reflectionDoneToday = state.reflectionHistory.some((entry) => entry.fullDate === todayFullDate);

  if (!tasksDone) {
    return 'tasks';
  }
  if (!habitsDone) {
    return 'habits';
  }
  if (!reflectionDoneToday) {
    return 'reflect';
  }
  return 'summary';
}

export function getFlowCTA(state: AppState) {
  const step = getFlowStep(state);
  return {
    step,
    ...FLOW_COPY[step],
  };
}

export function getFlowStatus(state: AppState) {
  const completedTasks = selectCompletedTasksCount(state);
  const completedHabits = selectCompletedHabitsCount(state);
  const totalTasks = selectTotalTasksCount(state);
  const totalHabits = selectTotalHabitsCount(state);
  const remainingTasks = selectRemainingTasksCount(state);
  const habitsLeft = Math.max(0, totalHabits - completedHabits);
  const action = getFlowCTA(state);

  const done = completedTasks + completedHabits;
  const total = totalTasks + totalHabits;
  const left = remainingTasks + habitsLeft;

  if (total === 0) {
    return {
      primary: '0 of 0 done · ready to begin',
      secondary: action.nextLine,
    };
  }

  if (done === total && action.step === 'summary') {
    return {
      primary: 'All done for today',
      secondary: action.nextLine,
    };
  }

  if (done === 0) {
    return {
      primary: `0 of ${total} done · ready to begin`,
      secondary: action.nextLine,
    };
  }

  if (done === total && action.step === 'reflect') {
    return {
      primary: `${done} of ${total} done · one last step`,
      secondary: action.nextLine,
    };
  }

  if (done === total) {
    return {
      primary: `${done} of ${total} done · all set`,
      secondary: action.nextLine,
    };
  }

  return {
    primary: `${done} of ${total} done · ${left} left`,
    secondary: action.nextLine,
  };
}
