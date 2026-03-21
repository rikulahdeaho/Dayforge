export function parsePositiveNumber(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.trunc(parsed);
}

export function toggleMultiSelectItem(item: string, selected: string[], max: number) {
  if (selected.includes(item)) {
    return selected.filter((value) => value !== item);
  }
  if (selected.length >= max) {
    return selected;
  }
  return [...selected, item];
}
