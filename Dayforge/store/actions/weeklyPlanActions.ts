export function getGoalTargetSuccessMessage(currentProgress: number, normalizedTarget: number) {
  if (currentProgress >= normalizedTarget) {
    return 'Weekly focus completed.';
  }

  return 'Weekly focus updated.';
}
