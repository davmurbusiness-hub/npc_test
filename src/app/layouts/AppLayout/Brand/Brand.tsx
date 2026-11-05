import { Text } from 'components/Text';

import styles from './Brand.module.scss';

export function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.mark} aria-hidden="true">
        Э
      </span>
      <div className={styles.text}>
        <Text as="span" weight="semibold" truncate>
          ППК РЭО
        </Text>
        <Text as="span" size="xs" color="secondary" truncate>
          Картотека граждан
        </Text>
      </div>
    </div>
  );
}
