import cn from 'classnames';
import { useId, useLayoutEffect, useRef, useState } from 'react';

import { Icon } from 'components/Icon';
import { Text } from 'components/Text';
import { isEmptyNode } from 'utils/isEmptyNode';

import styles from './Accordion.module.scss';

import type { ReactNode } from 'react';

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;
export type AccordionSize = 'sm' | 'md';

export interface AccordionProps {
  title: ReactNode;

  children?: ReactNode;

  icon?: ReactNode;

  count?: ReactNode;

  actions?: ReactNode;

  disabled?: boolean;

  open?: boolean;

  defaultOpen?: boolean;

  onOpenChange?: (open: boolean) => void;

  keepMounted?: boolean;

  headingLevel?: AccordionHeadingLevel;

  size?: AccordionSize;

  className?: string;
}

export function Accordion({
  title,
  children,
  icon,
  count,
  actions,
  disabled,
  open,
  defaultOpen = false,
  onOpenChange,
  keepMounted = false,
  headingLevel = 3,
  size = 'md',
  className,
}: AccordionProps) {
  const baseId = useId();
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const [mounted, setMounted] = useState(isOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const Heading = `h${headingLevel}` as const;
  const headerId = `${baseId}-h`;
  const panelId = `${baseId}-p`;

  if (isOpen && !mounted) setMounted(true);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (isOpen || !mounted || keepMounted || panel === null) return undefined;

    const running = typeof panel.getAnimations === 'function' ? panel.getAnimations() : [];
    if (running.length === 0) {
      setMounted(false);
      return undefined;
    }

    let stale = false;
    void Promise.allSettled(running.map((animation) => animation.finished)).then(() => {
      if (!stale) setMounted(false);
    });
    return () => {
      stale = true;
    };
  }, [isOpen, mounted, keepMounted]);

  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setInner(next);
    onOpenChange?.(next);
  };

  const hasIcon = !isEmptyNode(icon);
  const hasCount = !isEmptyNode(count);
  const hasActions = !isEmptyNode(actions);
  const isPlainCount = typeof count === 'string' || typeof count === 'number';

  return (
    <div
      className={cn(styles.item, styles[size], className)}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <div className={styles.row}>
        <Heading className={styles.heading}>
          <button
            type="button"
            id={headerId}
            className={styles.trigger}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={toggle}
          >
            {hasIcon && <span className={styles.icon}>{icon}</span>}
            <Text as="span" size={size} weight="medium" wrap="normal" className={styles.title}>
              {title}
            </Text>
            {hasCount && (
              <span className={isPlainCount ? styles.count : styles.countSlot}>{count}</span>
            )}
            <Icon name="chevronDown" size={size} className={styles.chevron} />
          </button>
        </Heading>
        {hasActions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div
        ref={panelRef}
        id={panelId}
        className={styles.panel}
        role={isOpen ? 'region' : undefined}
        aria-labelledby={isOpen ? headerId : undefined}
        inert={!isOpen}
      >
        <div className={styles.panelInner}>
          {(keepMounted || mounted) && <div className={styles.content}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
