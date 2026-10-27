import cn from 'classnames';

import { NoData } from 'components/NoData';
import { Text } from 'components/Text';

import styles from './KeyValueList.module.scss';

import type { ReactNode } from 'react';

export interface KeyValueItem {
  id: string;
  label: string;

  value: Exclude<ReactNode, boolean>;

  hint?: string;
}

export interface KeyValueListProps {
  items: readonly KeyValueItem[];
  className?: string;
}

export function KeyValueList({ items, className }: KeyValueListProps) {
  if (items.length === 0) return null;

  return (
    <dl className={cn(styles.root, className)}>
      {items.map(({ id, label, value, hint }) => (
        <div key={id} className={styles.row}>
          <Text as="dt" size="sm" color="secondary" wrap="normal" className={styles.label}>
            {label}
          </Text>
          <Text as="dd" size="sm" wrap="normal" className={styles.value}>
            {value ?? <NoData />}
            {hint ? (
              <Text as="span" size="xs" color="tertiary" wrap="normal" className={styles.hint}>
                {hint}
              </Text>
            ) : null}
          </Text>
        </div>
      ))}
    </dl>
  );
}
