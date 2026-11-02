import type { CollectionMonth } from 'types/dashboard';
import { formatMoney, formatPercent, formatMonth } from 'utils/format';

import styles from './CollectionChart.module.scss';

import type { TooltipContentProps } from 'recharts';

const monthOf = (payload: TooltipContentProps['payload']): CollectionMonth | null => {
  const row: unknown = payload[0]?.payload;
  return typeof row === 'object' && row !== null && 'period' in row
    ? (row as CollectionMonth)
    : null;
};

export function CollectionTooltip({ active, payload }: TooltipContentProps) {
  const month = active ? monthOf(payload) : null;
  if (month === null) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{formatMonth(month.period, 'full')}</p>
      <dl className={styles.tooltipList}>
        <dt>Собираемость</dt>
        <dd>{formatPercent(month.rate)}</dd>
        <dt>К оплате</dt>
        <dd>{formatMoney(month.charged)}</dd>
        <dt>Оплачено в срок</dt>
        <dd>{formatMoney(month.paidOnTime)}</dd>
      </dl>
    </div>
  );
}
