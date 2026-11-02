import cn from 'classnames';

import { Text } from 'components/Text';

import styles from './PageHeader.module.scss';

import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;

  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn(styles.root, className)}>
      <div className={styles.text}>
        <Text as="h1" size="2xl" weight="semibold">
          {title}
        </Text>
        {description && (
          <Text size="sm" color="secondary">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
