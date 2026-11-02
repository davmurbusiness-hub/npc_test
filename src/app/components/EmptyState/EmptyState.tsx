import cn from 'classnames';

import { Text } from 'components/Text';

import styles from './EmptyState.module.scss';

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.root, className)}>
      <Text size="md" weight="semibold">
        {title}
      </Text>
      {description && (
        <Text size="sm" color="secondary" className={styles.description}>
          {description}
        </Text>
      )}

      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
