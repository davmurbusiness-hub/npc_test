import cn from 'classnames';

import { NoData } from 'components/NoData';
import { formatNumber } from 'utils/format';
import type { NumberFormat } from 'utils/format';

import styles from './NumberText.module.scss';

export type { NumberFormat } from 'utils/format';

export type NumberTone =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'positive' | 'warning' | 'negative' | 'accent';

export interface NumberTextProps {
  value: number | null;
  format: NumberFormat;
  tone?: NumberTone;
  className?: string;
}

export function NumberText({ value, format, tone, className }: NumberTextProps) {
  const text = formatNumber(value, format);
  if (text === null) return <NoData className={className} />;

  return <span className={cn(styles.root, tone && styles[tone], className)}>{text}</span>;
}
