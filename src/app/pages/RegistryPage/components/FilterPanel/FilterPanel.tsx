import cn from 'classnames';

import { DICTIONARIES } from 'api/dictionaries';
import { Accordion } from 'components/Accordion';
import { MultiSelect } from 'components/MultiSelect';
import type { CitizenFilters, FilterValue } from 'types/registry';
import { countActiveFilters, listFilter, withFilter } from 'utils/registry';
import type { FilterKey, ListFilterKey } from 'utils/registry';

import styles from './FilterPanel.module.scss';

export interface FilterPanelProps {
  filters: CitizenFilters;
  onChange: (next: CitizenFilters) => void;
  className?: string;
}

export function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const activeCount = countActiveFilters(filters);

  function set(key: FilterKey, value: FilterValue) {
    onChange(withFilter(filters, key, value));
  }

  const list = (key: ListFilterKey) => ({
    value: listFilter(filters, key),
    onChange: (next: string[]) => {
      set(key, next);
    },
  });

  return (
    <Accordion
      title="Фильтры"
      count={activeCount > 0 ? activeCount : undefined}
      headingLevel={2}
      className={cn(styles.root, className)}
    >
      <div className={styles.fields}>
        <MultiSelect
          label="Статус карточки"
          placeholder="Любой"
          options={DICTIONARIES.cardStatus}
          {...list('status')}
        />
        <MultiSelect
          label="Район"
          placeholder="Все районы"
          searchable
          options={DICTIONARIES.district}
          {...list('districtIds')}
        />
        <MultiSelect
          label="Ответственный"
          placeholder="Любой"
          searchable
          options={DICTIONARIES.responsible}
          {...list('responsibleIds')}
        />
      </div>
    </Accordion>
  );
}
