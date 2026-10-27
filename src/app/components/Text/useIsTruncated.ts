import { useLayoutEffect, useState } from 'react';

function isOverflowing(element: HTMLElement): boolean {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
}

export function useIsTruncated(
  element: HTMLElement | null,
  enabled: boolean,
  watch: unknown
): boolean {
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    if (element === null || !enabled) return undefined;

    const measure = () => {
      setTruncated(isOverflowing(element));
    };
    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, enabled, watch]);

  return enabled && truncated;
}
