import { useLayoutEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FALLBACK_DURATION_MS = 150;
const FALLBACK_EASING = 'ease-out';

function parseDuration(value: string): number {
  const match = /^([\d.]+)(ms|s)$/.exec(value.trim());
  if (match === null) return FALLBACK_DURATION_MS;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

export function useAnimatedHeight(
  root: HTMLElement | null,
  inner: HTMLElement | null,
  clipClassName: string | undefined
): void {
  useLayoutEffect(() => {
    if (root === null || inner === null) return undefined;
    if (typeof ResizeObserver === 'undefined' || typeof root.animate !== 'function') {
      return undefined;
    }

    let animation: Animation | null = null;
    let lastWidth = inner.offsetWidth;
    let lastHeight = root.getBoundingClientRect().height;

    const finish = () => {
      animation = null;
      if (clipClassName !== undefined) root.classList.remove(clipClassName);
    };

    const observer = new ResizeObserver(() => {
      const width = inner.offsetWidth;
      const widthChanged = width !== lastWidth;
      lastWidth = width;

      const from = animation === null ? lastHeight : root.getBoundingClientRect().height;
      animation?.cancel();
      const to = root.getBoundingClientRect().height;
      lastHeight = to;

      const reduced =
        typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
      if (widthChanged || reduced || Math.abs(to - from) < 1) {
        finish();
        return;
      }

      const style = getComputedStyle(root);
      if (clipClassName !== undefined) root.classList.add(clipClassName);
      const running = root.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: parseDuration(style.getPropertyValue('--duration-fast')),
        easing: style.getPropertyValue('--easing').trim() || FALLBACK_EASING,
      });
      animation = running;
      running.onfinish = () => {
        if (animation === running) finish();
      };
    });
    observer.observe(inner);

    return () => {
      observer.disconnect();
      animation?.cancel();
      finish();
    };
  }, [root, inner, clipClassName]);
}
