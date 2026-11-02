import { Avatar } from 'src/app/components/Avatar';
import { IconButton } from 'src/app/components/IconButton';
import { Text } from 'src/app/components/Text';
import { useTheme } from 'src/app/hooks/useTheme';

import styles from './Topbar.module.scss';

const OPERATOR_NAME = 'Анна Соколова';

export function Topbar() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <header className={styles.topbar}>
      <div className={styles.spacer} />
      <IconButton
        icon={dark ? 'sun' : 'moon'}
        label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
        onClick={toggle}
      />
      <div className={styles.user}>
        <Avatar name={OPERATOR_NAME} />
        <div className={styles.userText}>
          <Text as="span" size="sm" weight="medium" truncate>
            {OPERATOR_NAME}
          </Text>
          <Text as="span" size="xs" color="secondary" truncate>
            Оператор
          </Text>
        </div>
      </div>
    </header>
  );
}
