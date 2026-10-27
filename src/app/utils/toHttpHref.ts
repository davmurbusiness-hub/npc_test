const HTTP_PREFIX = /^https?:\/\//i;

const LAST_SKIPPED_CODE = 0x20;

export function toHttpHref(url: string): string | null {
  let start = 0;
  while (start < url.length && url.charCodeAt(start) <= LAST_SKIPPED_CODE) {
    start += 1;
  }
  if (!HTTP_PREFIX.test(url.slice(start))) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.username !== '' || parsed.password !== '') return null;
    return parsed.href;
  } catch {
    return null;
  }
}
