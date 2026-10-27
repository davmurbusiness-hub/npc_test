import cn from 'classnames';
import { useId } from 'react';

import styles from './StatTile.module.scss';

import type { ReactNode } from 'react';

export type StatTileSize = 'md' | 'lg';

export interface StatTileProps {
  label: string;

  children: ReactNode;

  hint?: string | null;

  size?: StatTileSize;
  className?: string;
}

export function StatTile({ label, children, hint, size = 'md', className }: StatTileProps) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className={cn(styles.root, className)}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <span className={cn(styles.value, styles[size])}>{children}</span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
