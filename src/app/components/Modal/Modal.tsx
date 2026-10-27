import cn from 'classnames';
import { useId } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { useModalPanel } from 'hooks/ui';
import { isRenderable } from 'utils/isRenderable';

import styles from './Modal.module.scss';

import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export type ModalPlacement = 'center' | 'top';

export interface ModalProps {
  open: boolean;

  onClose: () => void;

  title: string;

  children: ReactNode;

  footer?: ReactNode;

  size?: ModalSize;

  placement?: ModalPlacement;

  closeOnOverlayClick?: boolean;

  closeOnEscape?: boolean;

  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  placement = 'center',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const titleId = useId();
  const { mounted, closing, panelRef, overlayProps } = useModalPanel(open, onClose, {
    closeOnEscape,
    closeOnOverlayClick,
  });

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(styles.overlay, placement === 'top' && styles.top, closing && styles.closing)}
      {...overlayProps}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.card, styles[size], className)}
      >
        <div className={styles.header}>
          <Text
            as="h2"
            id={titleId}
            size="2xl"
            weight="semibold"
            wrap="normal"
            className={styles.title}
          >
            {title}
          </Text>
          <IconButton
            icon="close"
            label="Закрыть"
            onClick={() => {
              onClose();
            }}
          />
        </div>
        <div className={styles.body}>{children}</div>
        {isRenderable(footer) && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
