import cn from 'classnames';
import { useEffect, useEffectEvent, useState } from 'react';

import { Icon } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { pickOwn } from 'utils/pickOwn';

import styles from './Toast.module.scss';

export type ToastTone = 'info' | 'negative';

export interface ToastProps {
  tone: ToastTone;
  text: string;

  onDismiss: () => void;
  className?: string;
}

export const TOAST_AUTO_DISMISS_MS = 5000;

interface ToneView {
  role: 'status' | 'alert';
  negative: boolean;
}

const TONE_VIEW = {
  info: { role: 'status', negative: false },
  negative: { role: 'alert', negative: true },
} satisfies Record<ToastTone, ToneView>;

const FALLBACK_VIEW: ToneView = TONE_VIEW.info;

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
    }, TOAST_AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [paused]);

  const view = pickOwn(TONE_VIEW, tone, FALLBACK_VIEW);

  return (
    <div
      className={cn(styles.toast, view.negative && styles.negative, className)}
      role={view.role}
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
        <Icon name={view.negative ? 'alert' : 'info'} size="md" />
      </span>
      <Text size="sm" wrap="normal">
        {text}
      </Text>
      <IconButton
        icon="close"
        label="Закрыть сообщение"
        size="sm"
        onClick={() => {
          onDismiss();
        }}
      />
    </div>
  );
}
