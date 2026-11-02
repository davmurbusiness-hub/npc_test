import { useEffect, useLayoutEffect, useRef } from 'react';

import { placePopup } from './placePopup';

import type { RefObject } from 'react';

export interface PopupOptions {
  open: boolean;
  itemCount: number;
  activeId: string | undefined;
  rootRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
}

export function usePopup({
  open,
  itemCount,
  activeId,
  rootRef,
  triggerRef,
  onDismiss,
}: PopupOptions) {
  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const update = () => {
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      const list = listRef.current;
      if (trigger === null || popup === null || list === null) return;
      const place = placePopup({
        anchor: trigger.getBoundingClientRect(),
        width: popup.offsetWidth,
        height: popup.offsetHeight - list.clientHeight + list.scrollHeight,
        maxHeight: Number.parseFloat(
          getComputedStyle(popup).getPropertyValue('--size-dropdown-max-height')
        ),
        viewport: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
        },
      });
      popup.dataset.placement = place.placement;
      popup.style.setProperty('--popup-left', `${place.left}px`);
      popup.style.setProperty('--popup-top', `${place.top}px`);
      popup.style.setProperty('--popup-bottom', `${place.bottom}px`);
      popup.style.setProperty('--popup-min-width', `${place.minWidth}px`);
      popup.style.setProperty('--popup-max-height', `${place.maxHeight}px`);
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, itemCount, triggerRef]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      onDismiss();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, rootRef, onDismiss]);

  useEffect(() => {
    if (activeId !== undefined)
      document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return { popupRef, listRef };
}
