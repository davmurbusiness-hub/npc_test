import cn from 'classnames';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { Text } from 'components/Text';
import { isRenderable } from 'utils/isRenderable';
import { pickOwn } from 'utils/pickOwn';

import styles from './Alert.module.scss';

import type { ReactNode } from 'react';

export type AlertTone = 'info' | 'warning' | 'negative';

const ROLE: Partial<Record<string, 'alert' | 'note'>> = {
  info: 'note',
  warning: 'note',
  negative: 'alert',
};
const ICON: Partial<Record<string, IconName>> = {
  info: 'info',
  warning: 'alert',
  negative: 'alert',
};
const TONE_CLASS: Partial<Record<string, string>> = {
  info: styles.info,
  warning: styles.warning,
  negative: styles.negative,
};

export interface AlertProps {
  tone?: AlertTone;

  title?: string;
  children: ReactNode;

  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, action, className }: AlertProps) {
  const hasTitle = Boolean(title?.trim());

  return (
    <div
      className={cn(styles.root, pickOwn(TONE_CLASS, tone, styles.info), className)}
      role={pickOwn(ROLE, tone, 'note')}
    >
      <span className={styles.icon}>
        <Icon name={pickOwn(ICON, tone, 'info')} size="md" />
      </span>
      <div className={styles.content}>
        {hasTitle && (
          <Text size="sm" weight="semibold" wrap="normal">
            {title}
          </Text>
        )}
        <Text as="div" size="sm" wrap="normal">
          {children}
        </Text>
      </div>

      {isRenderable(action) && <div className={styles.action}>{action}</div>}
    </div>
  );
}
