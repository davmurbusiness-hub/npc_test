export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlaceTooltipInput {
  anchor: Rect;

  size: Size;

  viewport: Size;

  placement: TooltipPlacement;
}

export interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
}

const GAP = 8;
const EDGE = 8;

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function spaceOn(side: TooltipPlacement, anchor: Rect, viewport: Size): number {
  switch (side) {
    case 'top':
      return anchor.top - EDGE;
    case 'bottom':
      return viewport.height - anchor.bottom - EDGE;
    case 'left':
      return anchor.left - EDGE;
    case 'right':
      return viewport.width - anchor.right - EDGE;
  }
}

function neededOn(side: TooltipPlacement, size: Size): number {
  return (side === 'top' || side === 'bottom' ? size.height : size.width) + GAP;
}

function centerClamped(center: number, length: number, limit: number): number {
  return Math.max(EDGE, Math.min(center - length / 2, limit - EDGE - length));
}

export function placeTooltip({
  anchor,
  size,
  viewport,
  placement,
}: PlaceTooltipInput): TooltipPosition {
  const opposite = OPPOSITE[placement];
  const desiredSpace = spaceOn(placement, anchor, viewport);
  const oppositeSpace = spaceOn(opposite, anchor, viewport);

  let side = placement;
  if (desiredSpace < neededOn(placement, size)) {
    side =
      oppositeSpace >= neededOn(opposite, size) || oppositeSpace > desiredSpace
        ? opposite
        : placement;
  }

  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;

  let top: number;
  let left: number;
  switch (side) {
    case 'top':
      top = anchor.top - GAP - size.height;
      left = centerClamped(centerX, size.width, viewport.width);
      break;
    case 'bottom':
      top = anchor.bottom + GAP;
      left = centerClamped(centerX, size.width, viewport.width);
      break;
    case 'left':
      top = centerClamped(centerY, size.height, viewport.height);
      left = anchor.left - GAP - size.width;
      break;
    case 'right':
      top = centerClamped(centerY, size.height, viewport.height);
      left = anchor.right + GAP;
      break;
  }

  return { top: Math.round(top), left: Math.round(left), placement: side };
}
