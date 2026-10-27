export function textOrNull(text: string | null | undefined): string | null {
  return typeof text === 'string' && text.trim() !== '' ? text : null;
}
