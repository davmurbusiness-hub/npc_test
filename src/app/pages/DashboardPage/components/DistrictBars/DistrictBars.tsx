import { labelOf } from 'api/dictionaries';
import type { DictValue } from 'types/common';
import type { DistrictsData } from 'types/dashboard';
import { formatCount, formatMoney, formatPercent } from 'utils/format';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import { BarList } from '../BarList';

export interface DistrictBarsProps {
  data: DistrictsData;
  selectedId: DictValue | null;
  className?: string;
}

export function DistrictBars({ data, selectedId, className }: DistrictBarsProps) {
  return (
    <BarList
      className={className}
      marker={
        data.averageShare === null
          ? undefined
          : {
              value: data.averageShare,
              label: `Среднее по районам: ${formatPercent(data.averageShare)}`,
            }
      }
      items={data.items.map((item) => {
        const label = labelOf('district', item.districtId);
        return {
          key: item.districtId,
          label,
          value: item.debtorShare,
          valueText: `${formatPercent(item.debtorShare)} · ${formatMoney(item.debtAmount, true)}`,
          href: item.debtors > 0 ? `${PATHS.registry}${drilldownSearch(item.link)}` : undefined,
          ariaLabel: `${label}: должников ${formatCount(item.debtors)} из ${formatCount(item.citizens)} (${formatPercent(item.debtorShare)}), долг ${formatMoney(item.debtAmount)}, открыть в картотеке`,
          selected: item.districtId === selectedId,
        };
      })}
    />
  );
}
