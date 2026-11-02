import type { IsoDate, IsoDateTime } from 'types/common';

export interface Civil {
  year: number;
  month: number;
  day: number;
}

const pad2 = (value: number): string => (value < 10 ? `0${value}` : String(value));

export function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yearOfEra = y - era * 400;
  const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra - 719468;
}

export function civilFromDays(days: number): Civil {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const dayOfEra = z - era * 146097;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36524) -
      Math.floor(dayOfEra / 146096)) /
      365
  );
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPart = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthPart + 2) / 5) + 1;
  const month = monthPart < 10 ? monthPart + 3 : monthPart - 9;
  const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

export function daysInMonth(year: number, month: number): number {
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return daysFromCivil(nextYear, nextMonth, 1) - daysFromCivil(year, month, 1);
}

export function isoToDays(iso: IsoDate): number {
  return daysFromCivil(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10)));
}

export function daysToIso(days: number): IsoDate {
  const { year, month, day } = civilFromDays(days);
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`;
}

export function toTimestamp(days: number, secondOfDay: number): IsoDateTime {
  const hours = Math.floor(secondOfDay / 3600);
  const minutes = Math.floor((secondOfDay % 3600) / 60);
  return `${daysToIso(days)}T${pad2(hours)}:${pad2(minutes)}:${pad2(secondOfDay % 60)}`;
}

export function addMonths(days: number, months: number): number {
  const { year, month, day } = civilFromDays(days);
  const total = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(total / 12);
  const targetMonth = total - targetYear * 12 + 1;
  return daysFromCivil(
    targetYear,
    targetMonth,
    Math.min(day, daysInMonth(targetYear, targetMonth))
  );
}

export function addYears(days: number, years: number): number {
  return addMonths(days, years * 12);
}

export function ageInYears(birthDays: number, onDays: number): number {
  const birth = civilFromDays(birthDays);
  const on = civilFromDays(onDays);
  const beforeBirthday = on.month < birth.month || (on.month === birth.month && on.day < birth.day);
  return on.year - birth.year - (beforeBirthday ? 1 : 0);
}
