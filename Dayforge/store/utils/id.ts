export function createEntityId(prefix: string, now = Date.now()) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${now}-${randomPart}`;
}
