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
