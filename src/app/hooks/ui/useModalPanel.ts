import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import { trapTab } from 'utils/focusable';
import { lock, unlock } from 'utils/scrollLock';

import type { AnimationEvent, MouseEvent, PointerEvent, RefObject } from 'react';

export interface ModalPanel {
  mounted: boolean;

  closing: boolean;

  panelRef: RefObject<HTMLDivElement | null>;

  overlayProps: {
    inert: boolean;
    onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
    onClick: (event: MouseEvent<HTMLDivElement>) => void;
  };
}

export interface ModalPanelOptions {
  closeOnEscape?: boolean;

  closeOnOverlayClick?: boolean;
}

const layers: HTMLElement[] = [];

function isTopLayer(panel: HTMLElement): boolean {
  return layers.at(-1) === panel;
}

function removeLayer(panel: HTMLElement): void {
  const index = layers.lastIndexOf(panel);
  if (index !== -1) layers.splice(index, 1);
}

export function useModalPanel(
  open: boolean,
  onClose: () => void,
  { closeOnEscape = true, closeOnOverlayClick = true }: ModalPanelOptions = {}
): ModalPanel {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressStartedInPanel = useRef(false);
  const [opener, setOpener] = useState<Element | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);
  const [closing, setClosing] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setOpener(open ? document.activeElement : null);
    setClosing(!open);
  }

  const handleKeyDown = useEffectEvent((event: KeyboardEvent, panel: HTMLElement) => {
    if (event.defaultPrevented || event.isComposing || !isTopLayer(panel)) return;

    if (event.key === 'Escape') {
      if (closeOnEscape) onClose();
    } else if (event.key === 'Tab' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      trapTab(event, panel);
    }
  });

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || panel === null) return;

    const previousFocus = opener ?? document.activeElement;

    panel.focus({ preventScroll: true });
    lock();
    layers.push(panel);

    const onKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event, panel);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      removeLayer(panel);
      unlock();
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open, opener]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!closing || panel === null) return;
    const name = getComputedStyle(panel).animationName;
    if (name === '' || name === 'none') setClosing(false);
  }, [closing]);

  return {
    mounted: open || closing,
    closing,
    panelRef,
    overlayProps: {
      inert: closing,
      onAnimationEnd: (event) => {
        if (closing && event.target === panelRef.current) setClosing(false);
      },
      onPointerDown: (event) => {
        pressStartedInPanel.current = event.target !== event.currentTarget;
      },
      onClick: (event) => {
        const pressedInPanel = pressStartedInPanel.current;

        pressStartedInPanel.current = false;
        if (closeOnOverlayClick && event.target === event.currentTarget && !pressedInPanel) {
          onClose();
        }
      },
    },
  };
}
