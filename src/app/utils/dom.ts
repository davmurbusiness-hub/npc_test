import type { ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([tabindex="-1"])',
  'input:not([type="hidden"]):not([tabindex="-1"])',
  'textarea:not([tabindex="-1"])',
  'select:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.matches(':disabled')
  );
}

export function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  const items = getFocusable(container);
  const first = items[0] ?? container;
  const last = items.at(-1) ?? container;
  const active = document.activeElement;

  let target: HTMLElement | null = null;
  if (!container.contains(active)) {
    target = event.shiftKey ? last : first;
  } else if (event.shiftKey && (active === first || active === container)) {
    target = last;
  } else if (!event.shiftKey && active === last) {
    target = first;
  }
  if (target === null) return;

  event.preventDefault();
  target.focus();
}

let lockCount = 0;
let savedOverflow = '';
let savedPaddingInlineEnd = '';

export function lock(): void {
  if (lockCount === 0) {
    const root = document.documentElement;
    const padding = Number.parseFloat(getComputedStyle(root).paddingInlineEnd) || 0;
    const widthWithScrollbar = root.getBoundingClientRect().width;
    savedOverflow = root.style.overflow;
    savedPaddingInlineEnd = root.style.paddingInlineEnd;
    root.style.overflow = 'hidden';

    const scrollbarWidth = root.getBoundingClientRect().width - widthWithScrollbar;
    root.style.paddingInlineEnd = `${padding + scrollbarWidth}px`;
  }
  lockCount += 1;
}

export function unlock(): void {
  lockCount -= 1;
  if (lockCount === 0) {
    const root = document.documentElement;
    root.style.overflow = savedOverflow;
    root.style.paddingInlineEnd = savedPaddingInlineEnd;
  }
}

export function isEmptyNode(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.every(isEmptyNode);
  if (node === undefined || node === null || typeof node === 'boolean') return true;
  return typeof node === 'string' && node.trim() === '';
}

export function isRenderable(node: ReactNode): boolean {
  if (Array.isArray(node)) return node.some(isRenderable);
  return node !== undefined && node !== null && typeof node !== 'boolean' && node !== '';
}
