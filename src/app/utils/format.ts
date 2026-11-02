import type { IsoDate, IsoDateTime, Percent } from 'types/common';

export interface PersonName {
  lastName: string | null;
  firstName: string | null;
  middleName: string | null;
}

export function fullNameOf(citizen: PersonName): string {
  return [citizen.lastName, citizen.firstName, citizen.middleName].filter(Boolean).join(' ');
}

export function formatIsoDate(iso: IsoDate): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

export function formatIsoDateTime(value: IsoDateTime): string {
  return `${formatIsoDate(value.slice(0, 10))} ${value.slice(11, 16)}`;
}

export function formatYears(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return `${years} год`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${years} года`;
  return `${years} лет`;
}

const sizeFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${sizeFormat.format(bytes / 1024)} КБ`;
  return `${sizeFormat.format(bytes / (1024 * 1024))} МБ`;
}

export function periodText(from: IsoDate | null, to: IsoDate | null, open = 'бессрочно'): string {
  if (from === null && to === null) return open;
  return [
    from === null ? null : `с ${formatIsoDate(from)}`,
    to === null ? null : `по ${formatIsoDate(to)}`,
  ]
    .filter(Boolean)
    .join(' ');
}

const NO_VALUE = '—';

export const formatCount = (value: number): string => formatNumber(value, 'count') ?? NO_VALUE;

export const formatPercent = (value: Percent | null): string =>
  value === null ? NO_VALUE : (formatNumber(value / 100, 'percent') ?? NO_VALUE);

export type NumberFormat = 'money' | 'percent' | 'count' | 'decimal';

export type NumberNotation = 'standard' | 'compact';

export type NumberSignDisplay = 'auto' | 'exceptZero';

export interface FormatNumberOptions {
  notation?: NumberNotation;

  signDisplay?: NumberSignDisplay;

  currency?: string;
}

const DEFAULT_CURRENCY = 'RUB';

function normalizeCurrency(currency: string | undefined): string {
  return typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency)
    ? currency.toUpperCase()
    : DEFAULT_CURRENCY;
}

function moneyOptions(currency: string): Intl.NumberFormatOptions {
  return { style: 'currency', currency, maximumFractionDigits: 0 };
}

function moneyCompactOptions(currency: string): Intl.NumberFormatOptions {
  return {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  };
}
const PERCENT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 1 };
const COUNT: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };
const COUNT_COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const DECIMAL: Intl.NumberFormatOptions = { maximumFractionDigits: 3 };

function optionsFor(
  format: NumberFormat,
  compact: boolean,
  currency: string
): Intl.NumberFormatOptions {
  if (format === 'money') return compact ? moneyCompactOptions(currency) : moneyOptions(currency);
  if (format === 'percent') return PERCENT;
  if (format === 'decimal') return DECIMAL;
  return compact ? COUNT_COMPACT : COUNT;
}

function normalizeFormat(format: NumberFormat): NumberFormat {
  return format === 'money' || format === 'percent' || format === 'decimal' ? format : 'count';
}

type IntlSign = 'negative' | 'exceptZero';

function intlSign(signDisplay: NumberSignDisplay): IntlSign {
  return signDisplay === 'exceptZero' ? 'exceptZero' : 'negative';
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(
  format: NumberFormat,
  compact: boolean,
  sign: IntlSign,
  currency: string
): Intl.NumberFormat {
  const key = `${format}|${compact ? 'compact' : 'standard'}|${sign}|${currency}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat('ru-RU', {
      ...optionsFor(format, compact, currency),
      signDisplay: sign,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatNumber(
  value: number | null,
  format: NumberFormat,
  { notation = 'standard', signDisplay = 'auto', currency }: FormatNumberOptions = {}
): string | null {
  if (value === null || !Number.isFinite(value)) return null;

  const kind = normalizeFormat(format);
  const compact = (kind === 'money' || kind === 'count') && notation === 'compact';

  const code = kind === 'money' ? normalizeCurrency(currency) : DEFAULT_CURRENCY;
  return formatterFor(kind, compact, intlSign(signDisplay), code).format(value);
}

export function textOrNull(text: string | null | undefined): string | null {
  return typeof text === 'string' && text.trim() !== '' ? text : null;
}

export const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : 'Неизвестная ошибка';
