import type { CitizenRow } from 'types/registry';

export type RowMatcher = (row: CitizenRow, index: number) => boolean;

const MIN_DIGITS = 3;

export function normalizeName(value: string): string {
  return value.toLowerCase().replaceAll('ё', 'е').trim();
}

function phoneDigits(digits: string): string {
  return digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
}

export function compileSearch(raw: string, nameKeys: readonly string[]): RowMatcher | null {
  const words = normalizeName(raw)
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word));
  const digits = raw.replace(/\D/g, '');
  const phone = phoneDigits(digits);
  const byName = words.length > 0;
  const byNumber = digits.length >= MIN_DIGITS;
  if (!byName && !byNumber) return null;

  return (row, index) => {
    if (byName) {
      const name = nameKeys[index] ?? '';
      if (!words.every((word) => name.includes(word))) return false;
    }
    if (byNumber) {
      return (
        (row.mobilePhone?.includes(phone) ?? false) ||
        row.snils.includes(digits) ||
        row.accountNumbers.some((account) => account.includes(digits))
      );
    }
    return true;
  };
}
