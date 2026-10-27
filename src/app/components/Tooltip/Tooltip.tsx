import cn from 'classnames';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { isEmptyNode } from 'utils/isEmptyNode';

import { placeTooltip } from './placeTooltip';
import styles from './Tooltip.module.scss';

import type { TooltipPlacement, TooltipPosition } from './placeTooltip';
import type {
  CSSProperties,
  FocusEvent,
  MutableRefObject,
  PointerEvent,
  ReactElement,
  ReactNode,
} from 'react';

export type { TooltipPlacement } from './placeTooltip';

export interface TooltipTarget {
  'aria-describedby'?: string;
}

export interface TooltipProps {
  content: ReactNode;

  children: ReactElement<TooltipTarget>;

  placement?: TooltipPlacement;

  delay?: number;

  className?: string;
}

type TimerRef = MutableRefObject<ReturnType<typeof setTimeout> | undefined>;

type TooltipStyle = CSSProperties & Record<'--tooltip-top' | '--tooltip-left', string>;

const DEFAULT_DELAY_MS = 300;

const CLOSE_DELAY_MS = 100;

function clearTimers(...timers: TimerRef[]) {
  timers.forEach((timer) => clearTimeout(timer.current));
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = DEFAULT_DELAY_MS,
  className,
}: TooltipProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<TooltipPosition | null>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const openTimer: TimerRef = useRef(undefined);
  const closeTimer: TimerRef = useRef(undefined);

  const fromPointer = useRef(false);

  const hasContent = !isEmptyNode(content);
  const shown = open && hasContent;

  if (!shown && place !== null) setPlace(null);

  const close = () => {
    clearTimers(openTimer, closeTimer);
    setOpen(false);
  };

  useEffect(() => () => clearTimers(openTimer, closeTimer), []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!shown || anchor === null || tip === null) return;
    const tipRect = tip.getBoundingClientRect();
    setPlace(
      placeTooltip({
        anchor: anchor.getBoundingClientRect(),
        size: { width: tipRect.width, height: tipRect.height },
        viewport: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
        placement,
      })
    );
  }, [shown, placement, content]);

  useEffect(() => {
    if (!shown) return undefined;

    const closeNow = () => {
      clearTimers(openTimer, closeTimer);
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      event.preventDefault();
      closeNow();
    };

    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', closeNow, true);
    window.addEventListener('resize', closeNow);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', closeNow, true);
      window.removeEventListener('resize', closeNow);
    };
  }, [shown]);

  if (!isValidElement(children)) return <>{children}</>;

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (!hasContent || event.pointerType === 'touch') return;
    clearTimeout(closeTimer.current);
    if (open) return;
    clearTimeout(openTimer.current);
    if (delay > 0) {
      openTimer.current = setTimeout(() => {
        setOpen(true);
      }, delay);
    } else {
      setOpen(true);
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    clearTimers(openTimer, closeTimer);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, CLOSE_DELAY_MS);
  };

  const handleTipEnter = () => {
    clearTimeout(closeTimer.current);
  };

  const handlePointerDown = () => {
    fromPointer.current = true;
    close();
  };

  const resetPointer = () => {
    fromPointer.current = false;
  };

  const handleFocus = () => {
    if (!hasContent || fromPointer.current) return;
    clearTimers(openTimer, closeTimer);
    setOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    close();
  };

  const tipStyle: TooltipStyle | undefined = place
    ? { '--tooltip-top': `${place.top}px`, '--tooltip-left': `${place.left}px` }
    : undefined;

  return (
    <>
      <span
        ref={anchorRef}
        className={cn(styles.anchor, className)}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerCancel={resetPointer}
        onClick={resetPointer}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {cloneElement(children, {
          'aria-describedby': joinIds(
            children.props['aria-describedby'],
            hasContent ? tipId : undefined
          ),
        })}
      </span>
      {hasContent &&
        createPortal(
          <span
            ref={tipRef}
            id={tipId}
            role="tooltip"
            hidden={!shown}
            className={styles.tooltip}
            data-placement={place?.placement}
            style={tipStyle}
            onPointerEnter={handleTipEnter}
            onPointerLeave={handlePointerLeave}
          >
            {content}
          </span>,
          document.body
        )}
    </>
  );
}
