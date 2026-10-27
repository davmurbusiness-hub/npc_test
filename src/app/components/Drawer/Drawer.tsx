import cn from 'classnames';
import { useId } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { useModalPanel } from 'hooks/ui';

import styles from './Drawer.module.scss';

import type { ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;

  onClose: () => void;

  title: string;
  children: ReactNode;

  className?: string;
}

export function Drawer({ open, onClose, title, children, className }: DrawerProps) {
  const titleId = useId();
  const { mounted, closing, panelRef, overlayProps } = useModalPanel(open, onClose);

  if (!mounted) return null;

  return createPortal(
    <div className={cn(styles.overlay, closing && styles.closing)} {...overlayProps}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.panel, className)}
      >
        <div className={styles.header}>
          <Text as="h2" id={titleId} size="lg" weight="semibold" wrap="normal">
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
      </div>
    </div>,
    document.body
  );
}
