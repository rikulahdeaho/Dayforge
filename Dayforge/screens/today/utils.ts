import { FlowStep } from '@/components/dayforge/flow';

export function resolveHeroKickoffText(progress: number, totalHabits: number, flowStep: FlowStep) {
  if (totalHabits === 0 || progress <= 0) {
    return "Let's get started";
  }
  if (progress >= 1 && flowStep === 'summary') {
    return "You're all set";
  }
  if (progress >= 1) {
    return 'Great job today';
  }
  if (progress >= 0.5) {
    return 'Halfway there';
  }
  return 'Keep the momentum going';
}

export function resolveHeroSupportText(habitsLeft: number, totalHabits: number, flowStep: FlowStep) {
  if (totalHabits === 0) {
    return 'Add your first habit to begin.';
  }
  if (habitsLeft === 0) {
    if (flowStep === 'summary') {
      return 'Your streak is alive. Today is complete.';
    }
    return 'All habits are done today.';
  }
  if (habitsLeft === totalHabits) {
    return 'Start with one small habit.';
  }
  if (habitsLeft === 2) {
    return 'Two more habits left.';
  }
  if (habitsLeft === 1) {
    return 'One more habit left.';
  }
  return `${habitsLeft} habits left.`;
}

export function resolveTrendCopy(trendDelta: number) {
  if (trendDelta > 0) {
    return `+${trendDelta} vs earlier this week`;
  }
  if (trendDelta < 0) {
    return `${Math.abs(trendDelta)} below early-week average`;
  }
  return 'On early-week average';
}

export function getTimeUntilDayEndsLabel(now: Date) {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());
  const totalMinutes = Math.ceil(diffMs / 60_000);

  if (totalMinutes <= 1) {
    return '<1m left';
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m left`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}
