import cn from 'classnames';
import { useId } from 'react';

import { Button } from 'components/Button';
import { IconButton } from 'components/IconButton';
import type { NotificationItem } from 'types/models';
import { pickOwn } from 'utils/pickOwn';
import { textOrNull } from 'utils/textOrNull';

import styles from './NotificationCard.module.scss';

const CREATED_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

function createdLabel(value: string | null): string | null {
  if (value === null) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : CREATED_FORMAT.format(date);
}

export interface NotificationCardProps {
  notification: NotificationItem;

  onAction: (notification: NotificationItem) => void;

  onDismiss?: (notification: NotificationItem) => void;

  className?: string;
}

const ACTION: Partial<Record<string, string>> = {
  alfa_analytics: 'Персонализировать через ИИ',
  company_event: 'Разобрать в ИИ-Аналитике',
};

export function NotificationCard({
  notification,
  onAction,
  onDismiss,
  className,
}: NotificationCardProps) {
  const titleId = useId();
  const title = textOrNull(notification.title);
  const text = textOrNull(notification.text);
  const created = createdLabel(notification.createdAt);
  const actionLabel = pickOwn<string | undefined>(ACTION, notification.kind, undefined);

  return (
    <article
      className={cn(styles.root, onDismiss !== undefined && styles.dismissible, className)}
      aria-labelledby={title !== null ? titleId : undefined}
    >
      {title !== null && (
        <h3 id={titleId} className={styles.title}>
          {title}
        </h3>
      )}
      {onDismiss !== undefined && (
        <IconButton
          className={styles.dismiss}
          icon="close"
          size="sm"
          label={title !== null ? `Удалить уведомление «${title}»` : 'Удалить уведомление'}
          onClick={() => {
            onDismiss(notification);
          }}
        />
      )}
      {created !== null && notification.createdAt !== null && (
        <time className={styles.created} dateTime={notification.createdAt}>
          {created}
        </time>
      )}
      {text !== null && <p className={styles.text}>{text}</p>}
      {actionLabel !== undefined && (
        <Button
          className={styles.action}
          variant="primary"
          size="sm"
          onClick={() => {
            onAction(notification);
          }}
        >
          {actionLabel}
        </Button>
      )}
    </article>
  );
}
