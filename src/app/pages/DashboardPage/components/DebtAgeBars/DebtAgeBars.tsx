import type { DebtAgeStat } from 'types/dashboard';
import { formatCount, formatMoney } from 'utils/format';
import { drilldownSearch } from 'utils/registry';
import { DEBT_AGE_LABELS } from 'utils/ui';

import { PATHS } from 'config/paths';

import { BarList } from '../BarList';

export interface DebtAgeBarsProps {
  items: readonly DebtAgeStat[];
  className?: string;
}

export function DebtAgeBars({ items, className }: DebtAgeBarsProps) {
  return (
    <BarList
      className={className}
      items={items.map((item) => {
        const label = DEBT_AGE_LABELS[item.bucket];
        const valueText = `${formatCount(item.citizens)} · ${formatMoney(item.amount, true)}`;
        return {
          key: item.bucket,
          label,
          value: item.citizens,
          valueText,
          href: item.citizens > 0 ? `${PATHS.registry}${drilldownSearch(item.link)}` : undefined,
          ariaLabel: `Долг ${label.toLowerCase()}: ${formatCount(item.citizens)} граждан, ${formatMoney(item.amount)}, открыть в картотеке`,
        };
      })}
    />
  );
}
