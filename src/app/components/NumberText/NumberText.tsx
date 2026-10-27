import cn from 'classnames';

import { NoData } from 'components/NoData';
import { formatNumber } from 'utils/formatNumber';
import type { NumberFormat, NumberNotation, NumberSignDisplay } from 'utils/formatNumber';

import styles from './NumberText.module.scss';

export type { NumberFormat, NumberNotation, NumberSignDisplay } from 'utils/formatNumber';

export type NumberTone =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'positive'
  | 'warning'
  | 'negative'
  | 'accent'
  | 'auto';

export interface NumberTextProps {
  value: number | null;
  format: NumberFormat;

  notation?: NumberNotation;

  signDisplay?: NumberSignDisplay;

  currency?: string;
  tone?: NumberTone;
  className?: string;
}

function toneClass(tone: NumberTone): Exclude<NumberTone, 'inherit' | 'auto'> | undefined {
  return tone === 'primary' ||
    tone === 'secondary' ||
    tone === 'tertiary' ||
    tone === 'info' ||
    tone === 'positive' ||
    tone === 'warning' ||
    tone === 'negative' ||
    tone === 'accent'
    ? tone
    : undefined;
}

function autoTone(value: number, text: string): 'positive' | 'negative' | undefined {
  if (!/[1-9]/.test(text)) return undefined;
  return value < 0 ? 'negative' : 'positive';
}

export function NumberText({
  value,
  format,
  notation = 'standard',
  signDisplay = 'auto',
  currency,
  tone = 'inherit',
  className,
}: NumberTextProps) {
  const text = formatNumber(value, format, { notation, signDisplay, currency });
  if (value === null || text === null) return <NoData className={className} />;

  const fullText =
    notation === 'compact'
      ? formatNumber(value, format, { notation: 'standard', signDisplay, currency })
      : null;

  const colorClass = tone === 'auto' ? autoTone(value, text) : toneClass(tone);

  return (
    <span
      className={cn(styles.root, colorClass && styles[colorClass], className)}
      title={fullText === null || fullText === text ? undefined : fullText}
    >
      {text}
    </span>
  );
}
