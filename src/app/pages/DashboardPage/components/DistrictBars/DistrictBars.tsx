import { labelOf } from 'api/dictionaries';
import type { DictValue } from 'types/common';
import type { DistrictsData } from 'types/dashboard';
import { formatCount } from 'utils/format';
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
        data.average === null
          ? undefined
          : {
              value: data.average,
              label: `Среднее по районам: ${formatCount(Math.round(data.average))}`,
            }
      }
      items={data.items.map((item) => {
        const label = labelOf('district', item.districtId);
        return {
          key: item.districtId,
          label,
          value: item.citizens,
          valueText: formatCount(item.citizens),
          href: item.citizens > 0 ? `${PATHS.registry}${drilldownSearch(item.link)}` : undefined,
          ariaLabel: `${label}: ${formatCount(item.citizens)} граждан, открыть в картотеке`,
          selected: item.districtId === selectedId,
        };
      })}
    />
  );
}
