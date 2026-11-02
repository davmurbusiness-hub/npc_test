import { labelOf } from 'api/dictionaries';
import { StatTile } from 'components/StatTile';
import { Text } from 'components/Text';
import type { Citizen } from 'types/entities';
import { formatYears } from 'utils/format';

import styles from './sections.module.scss';
import { useCitizen } from '../../context';

export function ComputedSection({ citizen }: { citizen: Citizen }) {
  const editing = useCitizen((state) => state.mode === 'edit');

  return (
    <div className={styles.computed}>
      <div className={styles.tiles}>
        <StatTile label="Район" hint="основного адреса проживания или регистрации">
          {citizen.districtId === null ? 'вне области' : labelOf('district', citizen.districtId)}
        </StatTile>
        <StatTile label="Возраст" hint="полных лет на сегодня">
          {formatYears(citizen.age)}
        </StatTile>
        <StatTile label="Иждивенцы" hint="члены семьи с отметкой «иждивенец»">
          {String(citizen.dependentsCount)}
        </StatTile>
      </div>
      {editing && (
        <Text size="sm" color="secondary">
          Показатели пересчитаются после сохранения карточки.
        </Text>
      )}
    </div>
  );
}
