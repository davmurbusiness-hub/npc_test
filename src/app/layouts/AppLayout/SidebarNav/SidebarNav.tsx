import cn from 'classnames';
import { NavLink } from 'react-router';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';

import { PATHS } from 'config/paths';

import styles from './SidebarNav.module.scss';

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

export function SidebarNav() {
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
