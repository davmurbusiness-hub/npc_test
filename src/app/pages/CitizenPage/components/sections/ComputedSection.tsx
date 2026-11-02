import { labelOf, formatBenefitCategory } from 'api/dictionaries';
import { NumberText } from 'components/NumberText';
import { StatTile } from 'components/StatTile';
import { Text } from 'components/Text';
import type { Citizen } from 'types/entities';

import styles from './sections.module.scss';
import { useCitizen } from '../../context';

export function ComputedSection({ citizen }: { citizen: Citizen }) {
  const editing = useCitizen((state) => state.mode === 'edit');
  const category = formatBenefitCategory(citizen.benefitCategory);

  return (
    <div className={styles.computed}>
      <div className={styles.tiles}>
        <StatTile label="Район" hint="основного адреса проживания или регистрации">
          {citizen.districtId === null ? 'вне области' : labelOf('district', citizen.districtId)}
        </StatTile>
        <StatTile label="Льготная категория" hint="подтверждённая льгота с наибольшей скидкой">
          {category === '' ? 'нет' : category}
        </StatTile>
        <StatTile label="Задолженность" hint="сумма долгов по платежам всех объектов">
          <NumberText
            value={citizen.debt}
            format="money"
            tone={citizen.debt > 0 ? 'negative' : undefined}
          />
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
