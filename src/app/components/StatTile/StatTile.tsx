import cn from 'classnames';
import { useId } from 'react';
import { Link } from 'react-router';

import { Icon } from 'components/Icon';

import styles from './StatTile.module.scss';

import type { ReactNode } from 'react';

export type StatTileTrend = 'up' | 'down' | 'flat';
export type StatTileDeltaTone = 'positive' | 'negative' | 'neutral';

export interface StatTileDelta {
  text: string;
  trend: StatTileTrend;
  tone: StatTileDeltaTone;
}

export interface StatTileProps {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  delta?: StatTileDelta;
  to?: string;
  onClick?: () => void;
  className?: string;
}

const TREND_ICON = { up: 'arrowUp', down: 'arrowDown' } as const;

export function StatTile({ label, children, hint, delta, to, onClick, className }: StatTileProps) {
  const labelId = useId();
  const interactive = to !== undefined || onClick !== undefined;
  const content = (
    <>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <span className={styles.value}>{children}</span>
      {delta && (
        <span className={cn(styles.delta, styles[delta.tone])}>
          {delta.trend !== 'flat' && <Icon name={TREND_ICON[delta.trend]} size="sm" />}
          {delta.text}
        </span>
      )}
      {hint && <span className={styles.hint}>{hint}</span>}
    </>
  );
  const rootClass = cn(styles.root, interactive && styles.interactive, className);

  if (to !== undefined) {
    return (
      <Link to={to} className={rootClass}>
        {content}
      </Link>
    );
  }
  if (onClick !== undefined) {
    return (
      <button type="button" onClick={onClick} className={rootClass}>
        {content}
      </button>
    );
  }
  return (
    <div role="group" aria-labelledby={labelId} className={rootClass}>
      {content}
    </div>
  );
}
