import cn from 'classnames';
import { Link } from 'react-router';

import styles from './BarList.module.scss';

import type { CSSProperties } from 'react';

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  valueText: string;
  href?: string;
  ariaLabel: string;
  selected?: boolean;
}

export interface BarListMarker {
  value: number;
  label: string;
}

export interface BarListProps {
  items: readonly BarListItem[];
  max?: number;
  marker?: BarListMarker;
  className?: string;
}

type BarStyle = CSSProperties & { '--bar-share': string };
type MarkerStyle = CSSProperties & { '--marker-share': string };

const barStyle = (value: string): BarStyle => ({ '--bar-share': value });
const markerStyle = (value: string): MarkerStyle => ({ '--marker-share': value });

const share = (value: number, max: number): string =>
  `${max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0}%`;

export function BarList({ items, max, marker, className }: BarListProps) {
  const scale = max ?? Math.max(0, ...items.map((item) => item.value), marker?.value ?? 0);
  const hasSelection = items.some((item) => item.selected === true);

  return (
    <div className={cn(styles.root, className)}>
      {marker && (
        <p className={styles.markerLegend}>
          <span className={styles.markerKey} aria-hidden="true" />
          {marker.label}
        </p>
      )}
      <ul className={styles.list}>
        {items.map((item) => {
          const content = (
            <>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.track} aria-hidden="true">
                <span
                  className={cn(styles.bar, hasSelection && !item.selected && styles.muted)}
                  style={barStyle(share(item.value, scale))}
                />
                {marker && (
                  <span className={styles.marker} style={markerStyle(share(marker.value, scale))} />
                )}
              </span>
              <span className={styles.value}>{item.valueText}</span>
            </>
          );
          return (
            <li key={item.key} className={cn(item.selected && styles.selected)}>
              {item.href === undefined ? (
                <span className={styles.row}>{content}</span>
              ) : (
                <Link
                  to={item.href}
                  aria-label={item.ariaLabel}
                  className={cn(styles.row, styles.link)}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
