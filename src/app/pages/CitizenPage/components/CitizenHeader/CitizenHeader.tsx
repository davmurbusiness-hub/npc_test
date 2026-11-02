import { labelOf } from 'api/dictionaries';
import { Avatar } from 'components/Avatar';
import { Badge } from 'components/Badge';
import { StatTile } from 'components/StatTile';
import { Text } from 'components/Text';
import type { Citizen } from 'types/entities';
import { formatIsoDateTime, formatYears, fullNameOf } from 'utils/format';
import { STATUS_TONE } from 'utils/ui';

import styles from './CitizenHeader.module.scss';

export interface CitizenHeaderProps {
  citizen: Citizen;
}

export function CitizenHeader({ citizen }: CitizenHeaderProps) {
  const fullName = fullNameOf(citizen);

  return (
    <header className={styles.root}>
      <div className={styles.identity}>
        <Avatar name={fullName} size="lg" />
        <div className={styles.text}>
          <Text as="h1" size="2xl" weight="semibold" className={styles.name}>
            {fullName}
          </Text>
          <div className={styles.meta}>
            <Text as="span" size="sm" color="secondary">
              № {citizen.cardNumber}
            </Text>
            <Badge tone={STATUS_TONE[citizen.status]}>
              {labelOf('cardStatus', citizen.status)}
            </Badge>
            <Text as="span" size="sm" color="tertiary">
              обновлена {formatIsoDateTime(citizen.updatedAt)}
            </Text>
          </div>
        </div>
      </div>
      <div className={styles.tiles}>
        <StatTile label="Район">
          {citizen.districtId === null ? 'вне области' : labelOf('district', citizen.districtId)}
        </StatTile>
        <StatTile label="Возраст" hint={`иждивенцев: ${citizen.dependentsCount}`}>
          {formatYears(citizen.age)}
        </StatTile>
      </div>
    </header>
  );
}
