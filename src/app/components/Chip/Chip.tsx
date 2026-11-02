import cn from 'classnames';

import { Icon } from 'components/Icon';

import styles from './Chip.module.scss';

import type { ReactNode } from 'react';

export interface ChipProps {
  children: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export function Chip({ children, onRemove, removeLabel = 'Убрать', className }: ChipProps) {
  return (
    <span className={cn(styles.root, onRemove && styles.removable, className)}>
      <span className={styles.label}>{children}</span>
      {onRemove && (
        <button type="button" aria-label={removeLabel} onClick={onRemove} className={styles.remove}>
          <Icon name="close" size="sm" />
        </button>
      )}
    </span>
  );
}
