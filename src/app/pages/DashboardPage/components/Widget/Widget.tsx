import cn from 'classnames';
import { useId } from 'react';

import { Text } from 'components/Text';

import styles from './Widget.module.scss';

import type { ReactNode, Ref } from 'react';

export interface WidgetProps {
  title: string;
  question: string;
  note?: string;
  actions?: ReactNode;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
  className?: string;
}

export function Widget({ title, question, note, actions, children, ref, className }: WidgetProps) {
  const titleId = useId();

  return (
    <section
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={cn(styles.root, className)}
    >
      <header className={styles.header}>
        <div className={styles.text}>
          <Text as="h2" id={titleId} size="md" weight="semibold">
            {title}
          </Text>
          <Text size="sm" color="secondary">
            {question}
          </Text>
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      <div className={styles.body}>{children}</div>
      {note && (
        <Text size="xs" color="tertiary">
          {note}
        </Text>
      )}
    </section>
  );
}
