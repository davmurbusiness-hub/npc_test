export function initialOf(name: string): string {
  return /[\p{L}\p{N}]/u.exec(name)?.[0]?.toUpperCase() ?? '';
}
