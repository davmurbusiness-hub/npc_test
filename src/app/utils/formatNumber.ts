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
