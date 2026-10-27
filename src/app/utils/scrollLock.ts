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
