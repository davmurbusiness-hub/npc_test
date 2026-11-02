import cn from 'classnames';

import { NoData } from 'components/NoData';
import { Text } from 'components/Text';
import { isRenderable } from 'utils/dom';

import styles from './fields.module.scss';
import { useFormScope } from './useBoundField';

import type { ReactNode } from 'react';

export interface FieldGridProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGrid({ title, children, className }: FieldGridProps) {
  const { editing } = useFormScope();
  const Tag = editing ? 'div' : 'dl';
  return (
    <section className={cn(styles.group, className)}>
      {title && (
        <Text as="h3" size="md" weight="semibold">
          {title}
        </Text>
      )}
      <Tag className={cn(styles.grid, editing ? styles.editGrid : styles.viewGrid)}>{children}</Tag>
    </section>
  );
}

export interface ViewPairProps {
  label: string;
  children?: ReactNode;
  wide?: boolean;
  className?: string;
}

export function ViewPair({ label, children, wide, className }: ViewPairProps) {
  const { editing } = useFormScope();
  return (
    <div className={cn(styles.pair, editing && styles.readOnly, wide && styles.wide, className)}>
      <Text as={editing ? 'span' : 'dt'} size="sm" color="secondary">
        {label}
      </Text>
      <Text as={editing ? 'span' : 'dd'} size="sm" className={styles.value}>
        {isRenderable(children) ? children : <NoData />}
      </Text>
    </div>
  );
}
