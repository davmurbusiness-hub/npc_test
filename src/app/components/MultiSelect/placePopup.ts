type PopupPlacement = 'top' | 'bottom';

interface PlacePopupInput {
  anchor: DOMRectReadOnly;
  width: number;
  height: number;
  maxHeight: number;
  viewport: { width: number; height: number };
}

interface PopupPosition {
  placement: PopupPlacement;
  left: number;
  top: number;
  bottom: number;
  minWidth: number;
  maxHeight: number;
}

const GAP = 4;
const EDGE = 8;
const FALLBACK_MAX_HEIGHT = 320;

export function placePopup({
  anchor,
  width,
  height,
  maxHeight,
  viewport,
}: PlacePopupInput): PopupPosition {
  const limit = Number.isFinite(maxHeight) ? maxHeight : FALLBACK_MAX_HEIGHT;
  const below = viewport.height - anchor.bottom - GAP - EDGE;
  const above = anchor.top - GAP - EDGE;
  const placement = below >= Math.min(height, limit) || below >= above ? 'bottom' : 'top';

  const fullWidth = Math.max(width, anchor.width);
  const left = Math.max(EDGE, Math.min(anchor.left, viewport.width - EDGE - fullWidth));

  return {
    placement,
    left: Math.round(left),
    top: Math.round(anchor.bottom + GAP),
    bottom: Math.round(viewport.height - anchor.top + GAP),
    minWidth: Math.round(anchor.width),
    maxHeight: Math.max(0, Math.floor(Math.min(limit, placement === 'bottom' ? below : above))),
  };
}
