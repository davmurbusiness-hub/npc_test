import cn from 'classnames';
import { useId } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { useModalPanel } from 'hooks/ui';
import { isRenderable } from 'utils/dom';

import styles from './Modal.module.scss';

import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export type ModalPlacement = 'center' | 'end';

export interface ModalProps {
  open: boolean;

  onClose: () => void;

  title: string;

  titleAside?: ReactNode;

  children: ReactNode;

  footer?: ReactNode;

  size?: ModalSize;

  placement?: ModalPlacement;

  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  titleAside,
  children,
  footer,
  size = 'md',
  placement = 'center',
  className,
}: ModalProps) {
  const titleId = useId();
  const { mounted, closing, panelRef, overlayProps } = useModalPanel(open, onClose);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        styles.overlay,
        placement === 'end' && styles.overlayEnd,
        closing && styles.closing
      )}
      {...overlayProps}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.card, placement === 'end' ? styles.end : styles[size], className)}
      >
        <div className={styles.header}>
          <Text as="h2" id={titleId} size="2xl" weight="semibold" className={styles.title}>
            {title}
          </Text>
          {isRenderable(titleAside) && <div className={styles.titleAside}>{titleAside}</div>}
          <IconButton icon="close" label="Закрыть" onClick={onClose} />
        </div>
        <div className={styles.body}>{children}</div>
        {isRenderable(footer) && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
