import { Link } from 'react-router';

import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Text } from 'components/Text';
import { visibleDuplicate } from 'stores/LocalStore/CitizenStore';

import { citizenPath } from 'config/paths';

import styles from './DuplicateAlert.module.scss';
import { useCitizen, useCitizenStore } from '../../context';

export function DuplicateAlert() {
  const store = useCitizenStore();
  const duplicate = useCitizen(visibleDuplicate);
  if (duplicate === null) return null;

  return (
    <div role="status" className={styles.root}>
      <Icon name="alert" size="md" color="warning" />
      <div className={styles.text}>
        <Text size="sm" weight="medium">
          Возможный дубль
        </Text>
        <Text size="sm" color="secondary">
          Этот СНИЛС уже указан в карточке{' '}
          <Link to={citizenPath(duplicate.existingId)} className={styles.link}>
            № {duplicate.existingCardNumber}
          </Link>{' '}
          — {duplicate.existingFullName}.
        </Text>
      </div>
      <Button size="sm" onClick={() => store.markAsDuplicate()}>
        Отметить как дубликат
      </Button>
    </div>
  );
}
