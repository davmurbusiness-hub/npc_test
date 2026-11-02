import cn from 'classnames';
import { useEffect, useRef } from 'react';

import { tabId, tabPanelId } from './tabIds';
import styles from './Tabs.module.scss';

import type { KeyboardEvent } from 'react';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  badge?: number;
}

export interface TabGroup<K extends string = string> {
  label?: string;
  items: readonly TabItem<K>[];
}

export type TabsOrientation = 'vertical' | 'horizontal';

export interface TabsProps<K extends string = string> {
  label: string;
  groups: readonly TabGroup<K>[];
  value: K;
  onChange: (key: K) => void;
  idPrefix: string;
  orientation?: TabsOrientation;
  badgeLabel?: string;
  className?: string;
}

export function Tabs<K extends string>({
  label,
  groups,
  value,
  onChange,
  idPrefix,
  orientation = 'horizontal',
  badgeLabel = 'ошибок',
  className,
}: TabsProps<K>) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const flat = groups.flatMap((group) => group.items);

  useEffect(() => {
    buttons.current.get(value)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value]);

  function focusAt(index: number) {
    const item = flat[(index + flat.length) % flat.length];
    if (item !== undefined) buttons.current.get(item.key)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        focusAt(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        focusAt(index - 1);
        break;
      case 'Home':
        focusAt(0);
        break;
      case 'End':
        focusAt(flat.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      className={cn(styles.root, styles[orientation], className)}
    >
      {groups.map((group, groupIndex) => (
        <div key={group.label ?? groupIndex} role="presentation" className={styles.group}>
          {group.label && (
            <span aria-hidden="true" className={styles.groupLabel}>
              {group.label}
            </span>
          )}
          {group.items.map((item) => {
            const selected = item.key === value;
            const index = flat.indexOf(item);
            const badge = item.badge ?? 0;
            return (
              <button
                key={item.key}
                ref={(node) => {
                  if (node === null) buttons.current.delete(item.key);
                  else buttons.current.set(item.key, node);
                }}
                type="button"
                role="tab"
                id={tabId(idPrefix, item.key)}
                aria-selected={selected}
                aria-controls={selected ? tabPanelId(idPrefix) : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(item.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(styles.tab, selected && styles.selected)}
              >
                <span className={styles.label}>{item.label}</span>
                {badge > 0 && (
                  <span className={styles.badge}>
                    <span aria-hidden="true">{badge}</span>
                    <span className={styles.srOnly}>
                      , {badgeLabel}: {badge}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
