import cn from 'classnames';

import { Toast } from 'components/Toast';
import type { ToastTone } from 'components/Toast';

import styles from './ToastStack.module.scss';

export type ToastStackTone = ToastTone;

export interface ToastStackItem {
  id: string;
  tone: ToastStackTone;
  text: string;
}

export interface ToastStackProps {
  toasts: readonly ToastStackItem[];

  onDismiss: (id: string) => void;
  className?: string;
}

export function ToastStack({ toasts, onDismiss, className }: ToastStackProps) {
  return (
    <section className={cn(styles.root, className)} aria-label="Системные сообщения">
      <ol className={styles.list} role="list">
        {toasts.map((toast) => (
          <li key={toast.id}>
            <Toast
              tone={toast.tone}
              text={toast.text}
              onDismiss={() => {
                onDismiss(toast.id);
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
