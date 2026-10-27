import cn from 'classnames';
import { useCallback, useId, useState } from 'react';
import { Link } from 'react-router';

import { isRenderable } from 'utils/isRenderable';

import styles from './Card.module.scss';
import { useAnimatedHeight } from './useAnimatedHeight';

import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type CardHeadingLevel = 2 | 3;
export type CardVariant = 'elevated' | 'outlined' | 'muted';
export type CardMediaRatio = 'wide' | 'standard' | 'square';

interface CardBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  title?: string;

  headingLevel?: CardHeadingLevel;

  caption?: ReactNode;

  description?: ReactNode;

  media?: ReactNode;

  mediaRatio?: CardMediaRatio;

  actions?: ReactNode;

  footer?: ReactNode;

  variant?: CardVariant;

  animateHeight?: boolean;

  ref?: Ref<HTMLElement>;
  className?: string;
  children?: ReactNode;
}

interface StaticCardProps extends CardBaseProps {
  to?: undefined;
}

interface LinkCardProps extends CardBaseProps {
  to: string;
  title: string;
}

export type CardProps = StaticCardProps | LinkCardProps;

const RATIO_CLASS: Record<CardMediaRatio, string | undefined> = {
  wide: styles.ratioWide,
  standard: styles.ratioStandard,
  square: styles.ratioSquare,
};

export function Card({
  title,
  headingLevel = 2,
  caption,
  description,
  media,
  mediaRatio = 'wide',
  actions,
  footer,
  variant = 'elevated',
  animateHeight = false,
  to,
  ref,
  className,
  children,
  ...rest
}: CardProps) {
  const titleId = useId();
  const hasTitle = Boolean(title?.trim());
  const isLink = hasTitle && to !== undefined;

  const hasCaption = isRenderable(caption);
  const hasDescription = isRenderable(description);
  const hasActions = isRenderable(actions);
  const hasChildren = isRenderable(children);
  const hasMedia = isRenderable(media);
  const hasFooter = isRenderable(footer);

  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const [innerElement, setInnerElement] = useState<HTMLDivElement | null>(null);
  useAnimatedHeight(rootElement, animateHeight ? innerElement : null, styles.clip);

  const rootRef = useCallback(
    (node: HTMLElement | null) => {
      setRootElement(node);
      if (typeof ref === 'function') return ref(node);
      if (ref) ref.current = node;
      return undefined;
    },
    [ref]
  );

  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const titleNode = hasTitle ? (
    <Heading id={titleId} className={styles.title}>
      {isLink ? (
        <Link to={to} className={styles.titleLink}>
          {title}
        </Link>
      ) : (
        title
      )}
    </Heading>
  ) : null;
  const actionsNode = hasActions ? <div className={styles.actions}>{actions}</div> : null;

  const rootClassName = cn(styles.root, styles[variant], isLink && styles.openable, className);
  const slots = (
    <>
      {hasMedia && <div className={cn(styles.media, RATIO_CLASS[mediaRatio])}>{media}</div>}
      <div className={styles.content}>
        {(hasCaption || hasDescription || titleNode || actionsNode) && (
          <div className={styles.head}>
            {hasCaption && <div className={styles.caption}>{caption}</div>}
            {(titleNode ?? actionsNode) && (
              <div className={styles.titleRow}>
                {titleNode}
                {actionsNode}
              </div>
            )}
            {hasDescription && <div className={styles.description}>{description}</div>}
          </div>
        )}
        {hasChildren && <div className={styles.body}>{children}</div>}
        {hasFooter && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
  const content = animateHeight ? (
    <div ref={setInnerElement} className={styles.inner}>
      {slots}
    </div>
  ) : (
    slots
  );

  if (hasTitle) {
    return (
      <section {...rest} ref={rootRef} aria-labelledby={titleId} className={rootClassName}>
        {content}
      </section>
    );
  }

  return (
    <div {...rest} ref={rootRef} className={rootClassName}>
      {content}
    </div>
  );
}
