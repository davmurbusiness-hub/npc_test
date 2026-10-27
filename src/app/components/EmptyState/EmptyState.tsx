import cn from 'classnames';

import { Text } from 'components/Text';
import { isRenderable } from 'utils/isRenderable';

import styles from './EmptyState.module.scss';

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;

  description?: string;

  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  const hasDescription = Boolean(description?.trim());

  return (
    <div className={cn(styles.root, className)}>
      <Text size="md" weight="semibold" wrap="normal">
        {title}
      </Text>
      {hasDescription && (
        <Text size="sm" color="secondary" wrap="normal" className={styles.description}>
          {description}
        </Text>
      )}

      {isRenderable(action) && <div className={styles.action}>{action}</div>}
    </div>
  );
}
