import cn from 'classnames';
import { useId, useLayoutEffect, useRef, useState } from 'react';

import { Icon } from 'components/Icon';
import { Text } from 'components/Text';

import styles from './Accordion.module.scss';

import type { ReactNode } from 'react';

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;
export type AccordionSize = 'sm' | 'md';

export interface AccordionProps {
  title: ReactNode;

  children?: ReactNode;

  count?: number;

  defaultOpen?: boolean;

  headingLevel?: AccordionHeadingLevel;

  size?: AccordionSize;

  className?: string;
}

export function Accordion({
  title,
  children,
  count,
  defaultOpen = false,
  headingLevel = 3,
  size = 'md',
  className,
}: AccordionProps) {
  const baseId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(isOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const Heading = `h${headingLevel}` as const;
  const headerId = `${baseId}-h`;
  const panelId = `${baseId}-p`;

  if (isOpen && !mounted) setMounted(true);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (isOpen || !mounted || panel === null) return undefined;

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
  }, [isOpen, mounted]);

  return (
    <div
      className={cn(styles.item, styles[size], className)}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <Heading className={styles.heading}>
        <button
          type="button"
          id={headerId}
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Text as="span" size={size} weight="medium" className={styles.title}>
            {title}
          </Text>
          {count !== undefined && <span className={styles.count}>{count}</span>}
          <Icon name="chevronDown" size={size} className={styles.chevron} />
        </button>
      </Heading>
      <div
        ref={panelRef}
        id={panelId}
        className={styles.panel}
        role={isOpen ? 'region' : undefined}
        aria-labelledby={isOpen ? headerId : undefined}
        inert={!isOpen}
      >
        <div className={styles.panelInner}>
          {mounted && <div className={styles.content}>{children}</div>}
        </div>
      </div>
    </div>
  );
}
