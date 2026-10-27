import cn from 'classnames';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { pickOwn } from 'utils/pickOwn';

import styles from './Text.module.scss';
import { useIsTruncated } from './useIsTruncated';

import type {
  CSSProperties,
  ElementType,
  FocusEvent,
  FocusEventHandler,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  PointerEvent,
  PointerEventHandler,
  ReactNode,
  Ref,
} from 'react';

export type TextTag =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'strong'
  | 'em'
  | 'small'
  | 'li'
  | 'dt'
  | 'dd'
  | 'figcaption';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'inherit';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverted'
  | 'link'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'accent'
  | 'inherit';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TextWrap = 'clamp' | 'nowrap' | 'normal';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  as?: TextTag;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;

  wrap?: TextWrap;

  lines?: number;

  htmlFor?: string;
  ref?: Ref<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onPointerCancel?: PointerEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  children: ReactNode;
}

const DEFAULT_LINES = 3;

const VIEWPORT_EDGE = 8;

const SIZE_CLASS: Record<TextSize, string | undefined> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  '2xl': styles.xl2,
  '3xl': styles.xl3,
  '4xl': styles.xl4,
  inherit: styles.inheritSize,
};

const COLOR_CLASS: Partial<Record<string, string>> = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  inverted: styles.inverted,
  link: styles.link,
  positive: styles.positive,
  negative: styles.negative,
  warning: styles.warning,
  info: styles.info,
  accent: styles.accent,
  inherit: styles.inherit,
};

const WEIGHT_CLASS: Partial<Record<string, string>> = {
  regular: styles.regular,
  medium: styles.medium,
  semibold: styles.semibold,
  bold: styles.bold,
};

function clampLines(lines: number): number {
  if (!Number.isFinite(lines)) return DEFAULT_LINES;
  return Math.max(1, Math.floor(lines));
}

function placeTooltip(anchor: HTMLElement, tooltip: HTMLElement) {
  const a = anchor.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();
  const fitsBelow = a.bottom + t.height <= window.innerHeight;
  const fitsAbove = a.top - t.height >= 0;
  const top = fitsBelow || !fitsAbove ? a.bottom : a.top - t.height;
  const maxLeft = Math.max(VIEWPORT_EDGE, window.innerWidth - t.width - VIEWPORT_EDGE);
  const left = Math.min(Math.max(a.left, VIEWPORT_EDGE), maxLeft);

  tooltip.style.setProperty('--tooltip-top', `${top}px`);
  tooltip.style.setProperty('--tooltip-left', `${left}px`);
}

export function Text({
  as = 'p',
  size = 'md',
  color = 'primary',
  weight = 'regular',
  wrap = 'clamp',
  lines = DEFAULT_LINES,
  className,
  style,
  tabIndex,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerCancel,
  onClick,
  onFocus,
  onBlur,
  ...rest
}: TextProps) {
  const Tag: ElementType = as;
  const tooltipId = useId();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLElement | null>(null);

  const pointerTypeRef = useRef<string | null>(null);

  const truncated = useIsTruncated(element, wrap !== 'normal', children);
  const shown = open && truncated;

  if (open && !truncated) setOpen(false);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  useLayoutEffect(() => {
    if (!shown || element === null || tooltipRef.current === null) return;
    placeTooltip(element, tooltipRef.current);
  }, [shown, element]);

  useEffect(() => {
    if (!shown) return undefined;

    const close = () => {
      setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };
    const onOutsidePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (element?.contains(target) || tooltipRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('pointerdown', onOutsidePointerDown, true);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('pointerdown', onOutsidePointerDown, true);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [shown, element]);

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType !== 'touch') setOpen(true);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    if (event.pointerType === 'touch') return;
    const next = event.relatedTarget;
    if (next instanceof Node && tooltipRef.current?.contains(next)) return;
    setOpen(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    onPointerDown?.(event);
    pointerTypeRef.current = event.pointerType;
  };

  const handlePointerCancel = (event: PointerEvent<HTMLElement>) => {
    onPointerCancel?.(event);
    pointerTypeRef.current = null;
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    const pointerType = pointerTypeRef.current;
    pointerTypeRef.current = null;
    if (pointerType === 'touch') setOpen((value) => !value);
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    onFocus?.(event);
    if (pointerTypeRef.current === null) setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    onBlur?.(event);
    setOpen(false);
  };

  const describedBy = [rest['aria-describedby'], truncated ? tooltipId : undefined]
    .filter(Boolean)
    .join(' ');

  const rootStyle = wrap === 'clamp' ? { ...style, '--lines': clampLines(lines) } : style;

  return (
    <>
      <Tag
        {...rest}
        ref={setRefs}
        className={cn(
          styles.root,
          SIZE_CLASS[size],
          pickOwn(COLOR_CLASS, color, styles.primary),
          pickOwn(WEIGHT_CLASS, weight, styles.regular),
          wrap !== 'normal' && styles[wrap],
          className
        )}
        style={rootStyle}
        tabIndex={truncated ? (tabIndex ?? 0) : tabIndex}
        aria-describedby={describedBy || undefined}
        onPointerEnter={truncated ? handlePointerEnter : onPointerEnter}
        onPointerLeave={truncated ? handlePointerLeave : onPointerLeave}
        onPointerDown={truncated ? handlePointerDown : onPointerDown}
        onPointerCancel={truncated ? handlePointerCancel : onPointerCancel}
        onClick={truncated ? handleClick : onClick}
        onFocus={truncated ? handleFocus : onFocus}
        onBlur={truncated ? handleBlur : onBlur}
      >
        {children}
      </Tag>
      {truncated &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            hidden={!shown}
            className={styles.tooltip}
            onPointerLeave={(event: PointerEvent<HTMLElement>) => {
              const next = event.relatedTarget;
              if (next instanceof Node && element?.contains(next)) return;
              setOpen(false);
            }}
          >
            {children}
          </span>,
          document.body
        )}
    </>
  );
}
