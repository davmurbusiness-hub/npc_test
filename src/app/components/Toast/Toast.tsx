import cn from 'classnames';
import { useEffect, useEffectEvent, useState } from 'react';

import { Icon } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';

import styles from './Toast.module.scss';

export type ToastTone = 'info' | 'negative';

export interface ToastProps {
  tone: ToastTone;
  text: string;
  onDismiss: () => void;
  className?: string;
}

const AUTO_DISMISS_MS = 5000;

export function Toast({ tone, text, onDismiss, className }: ToastProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;

  const dismiss = useEffectEvent(() => {
    onDismiss();
  });

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [paused]);

  const negative = tone === 'negative';

  return (
    <div
      className={cn(styles.toast, negative && styles.negative, className)}
      role={negative ? 'alert' : 'status'}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return;
        }
        setFocused(false);
      }}
    >
      <span className={styles.icon}>
        <Icon name={negative ? 'alert' : 'info'} size="md" />
      </span>
      <Text size="sm">{text}</Text>
      <IconButton icon="close" label="Закрыть сообщение" size="sm" onClick={onDismiss} />
    </div>
  );
}
