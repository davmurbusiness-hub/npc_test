import cn from 'classnames';

import { Select } from 'components/Select';

import styles from './FilterBar.module.scss';
import { useDashboard, useDashboardStore } from '../../context';

export interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className }: FilterBarProps) {
  const store = useDashboardStore();
  const districtId = useDashboard((state) => state.filters.districtId);
  const responsibleId = useDashboard((state) => state.filters.responsibleId);

  return (
    <div className={cn(styles.root, className)}>
      <Select
        label="Район"
        options={store.districtOptions}
        value={districtId}
        onChange={(value) => store.setDistrict(value)}
        placeholder="Все районы"
        className={styles.field}
      />
      <Select
        label="Ответственный"
        options={store.responsibleOptions}
        value={responsibleId}
        onChange={(value) => store.setResponsible(value)}
        placeholder="Все ответственные"
        className={styles.field}
      />
    </div>
  );
}
