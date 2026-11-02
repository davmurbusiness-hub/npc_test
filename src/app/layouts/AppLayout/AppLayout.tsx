import cn from 'classnames';
import { NavLink, Outlet } from 'react-router';

import { Avatar } from 'components/Avatar';
import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { useTheme } from 'hooks/useTheme';

import { PATHS } from 'config/paths';

import styles from './AppLayout.module.scss';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { to: PATHS.dashboard, label: 'Обзор', icon: 'home', end: true },
  { to: PATHS.registry, label: 'Картотека', icon: 'users' },
];

const OPERATOR_NAME = 'Анна Соколова';

function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        Э
      </span>
      <div className={styles.brandText}>
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

function SidebarNav() {
  return (
    <nav aria-label="Основная навигация" className={styles.nav}>
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(styles.link, isActive && styles.active)}
        >
          <Icon name={icon} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className={styles.root}>
      <a href="#content" className={styles.skipLink}>
        Перейти к содержимому
      </a>

      <aside className={styles.sidebar}>
        <Brand />
        <SidebarNav />
      </aside>

      <div className={styles.main}>
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

        <main id="content" tabIndex={-1} className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
