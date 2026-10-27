import cn from 'classnames';

import { Button } from 'components/Button';
import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import type { Feedback, FeedbackReason, FeedbackValue } from 'types/models';

import styles from './FeedbackBar.module.scss';

export interface FeedbackBarProps {
  value: Feedback | null;

  onChange: (next: Feedback) => void;

  disabled?: boolean;

  locked?: boolean;
  className?: string;
}

const GROUP_LABEL = 'Оценка ответа';
const REASONS_GROUP_LABEL = 'Причина оценки';
const LABEL_UP = 'Ответ полезен';
const LABEL_DOWN = 'Ответ не полезен';
const THANKS = 'Спасибо за оценку';
const REASON_HINT = 'Выберите причину, чтобы отправить оценку';

const REASON_LABEL = {
  off_topic: 'Не по теме',
  factual_error: 'Ошибка в фактах',
  too_general: 'Слишком общо',
  other: 'Другое',
} satisfies Record<FeedbackReason, string>;

const REASON_ORDER = [
  'off_topic',
  'factual_error',
  'too_general',
  'other',
] as const satisfies readonly FeedbackReason[];

export function FeedbackBar({
  value,
  onChange,
  disabled = false,
  locked = false,
  className,
}: FeedbackBarProps) {
  const sent = value?.value === 'up' || (value?.value === 'down' && value.reason !== null);
  const status = sent ? THANKS : value?.value === 'down' ? REASON_HINT : null;

  const ariaDisabled = locked || undefined;

  function rate(next: FeedbackValue) {
    if (locked || value?.value === next) return;
    onChange({ value: next, reason: null });
  }

  return (
    <div
      className={cn(styles.root, className)}
      role="group"
      aria-label={GROUP_LABEL}
      aria-disabled={ariaDisabled}
    >
      <div className={styles.thumbs}>
        <IconButton
          icon="thumbUp"
          label={LABEL_UP}
          aria-pressed={value?.value === 'up'}
          aria-disabled={ariaDisabled}
          disabled={disabled}
          onClick={() => {
            rate('up');
          }}
        />
        <IconButton
          icon="thumbDown"
          label={LABEL_DOWN}
          aria-pressed={value?.value === 'down'}
          aria-disabled={ariaDisabled}
          disabled={disabled}
          onClick={() => {
            rate('down');
          }}
        />
      </div>
      {value?.value === 'down' && (
        <div className={styles.reasons} role="group" aria-label={REASONS_GROUP_LABEL}>
          {REASON_ORDER.map((reason) => (
            <Button
              key={reason}
              variant="ghost"
              size="sm"
              aria-pressed={value.reason === reason}
              aria-disabled={ariaDisabled}
              disabled={disabled}
              onClick={() => {
                if (locked || value.reason === reason) return;
                onChange({ value: 'down', reason });
              }}
            >
              {REASON_LABEL[reason]}
            </Button>
          ))}
        </div>
      )}
      <Text size="sm" color="secondary" wrap="normal" className={styles.thanks} role="status">
        {status}
      </Text>
    </div>
  );
}
