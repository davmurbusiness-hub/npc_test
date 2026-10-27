export function pickOwn<T>(map: Partial<Record<string, T>>, key: string, fallback: T): T {
  return Object.hasOwn(map, key) ? (map[key] ?? fallback) : fallback;
}
