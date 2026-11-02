import type { CitizenId, IsoDate, RowId } from 'types/common';
import type { CardStatus } from 'types/dictionaries';
import type { Payment, TableKey } from 'types/entities';
import type { CitizenDraft, FieldIssue, IssueCode, Severity } from 'types/form';
import { ageInYears, isoToDays } from 'utils/isoDate';
import { isMaskComplete } from 'utils/masks';
import type { MaskName } from 'utils/masks';

export interface ValidationContext {
  today: IsoDate;
  citizenId: CitizenId;
  previousStatus: CardStatus;
  payments: readonly Pick<Payment, 'objectId'>[];
}

export interface RowContext {
  today: IsoDate;
  citizen: CitizenDraft;
}

export interface IssueSink {
  readonly list: FieldIssue[];
  add(field: string, code: IssueCode, message: string, severity?: Severity): void;
}

export function issueSink(
  table: TableKey,
  rowId: RowId | null,
  list: FieldIssue[] = []
): IssueSink {
  return {
    list,
    add(field, code, message, severity = 'error') {
      list.push({ table, rowId, field, severity, code, message });
    },
  };
}

export const MESSAGES = {
  required: 'Обязательное поле',
  cyrillic: 'Только русские буквы, дефис и пробел',
  email: 'Адрес почты в формате name@example.ru',
  snils: 'Неверная контрольная сумма СНИЛС',
  future: 'Дата не может быть в будущем',
} as const;

export function isBlank(value: unknown): boolean {
  return value === null || (typeof value === 'string' && value.trim() === '');
}

export function checkRequired(sink: IssueSink, values: object, required: object): void {
  const record: Record<string, unknown> = { ...values };
  for (const key of Object.keys(required)) {
    if (isBlank(record[key])) sink.add(key, 'required', MESSAGES.required);
  }
}

export function requireWhen(sink: IssueSink, field: string, value: unknown, when: boolean): void {
  if (when && isBlank(value)) sink.add(field, 'required', MESSAGES.required);
}

const CYRILLIC_NAME = /^[А-ЯЁа-яё]+(?:[-' ][А-ЯЁа-яё]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function checkCyrillic(sink: IssueSink, field: string, value: string | null): void {
  if (value !== null && value.trim() !== '' && !CYRILLIC_NAME.test(value.trim())) {
    sink.add(field, 'format', MESSAGES.cyrillic);
  }
}

export function checkEmail(sink: IssueSink, field: string, value: string | null): void {
  if (value !== null && !EMAIL.test(value)) sink.add(field, 'format', MESSAGES.email);
}

export function checkMask(
  sink: IssueSink,
  field: string,
  value: string | null,
  mask: MaskName,
  message: string
): void {
  if (value !== null && value !== '' && !isMaskComplete(mask, value)) {
    sink.add(field, 'mask', message);
  }
}

export function isValidSnils(snils: string): boolean {
  if (!/^\d{11}$/.test(snils)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (snils.charCodeAt(i) - 48) * (9 - i);
  let control = sum < 100 ? sum : sum % 101;
  if (control >= 100) control = 0;
  return control === Number(snils.slice(9));
}

export function checkSnils(sink: IssueSink, field: string, value: string | null): void {
  if (value === null || value === '') return;
  if (!isMaskComplete('snils', value)) sink.add(field, 'mask', 'СНИЛС — 11 цифр');
  else if (!isValidSnils(value)) sink.add(field, 'format', MESSAGES.snils);
}

export const isIsoDate = (value: string | null): value is IsoDate =>
  value !== null && ISO_DATE.test(value);

export function checkNotFuture(
  sink: IssueSink,
  field: string,
  date: IsoDate | null,
  today: IsoDate
): void {
  if (isIsoDate(date) && date > today) sink.add(field, 'range', MESSAGES.future);
}

export function checkOrder(
  sink: IssueSink,
  field: string,
  from: IsoDate | null,
  to: IsoDate | null,
  message: string
): void {
  if (isIsoDate(from) && isIsoDate(to) && to < from) sink.add(field, 'order', message);
}

export function checkRange(
  sink: IssueSink,
  field: string,
  value: number | null,
  min: number,
  max: number,
  message: string
): void {
  if (value !== null && (!Number.isFinite(value) || value < min || value > max)) {
    sink.add(field, 'range', message);
  }
}

export function ageOn(birthDate: IsoDate | null, today: IsoDate): number | null {
  return isIsoDate(birthDate) ? ageInYears(isoToDays(birthDate), isoToDays(today)) : null;
}

export const yearOf = (date: IsoDate | null): number | null =>
  isIsoDate(date) ? Number(date.slice(0, 4)) : null;
