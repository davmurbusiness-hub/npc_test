import {
  CHAR_WIDTH,
  END_ANCHOR_FROM,
  GLYPH_SLOT,
  LABEL_GAP,
  LABEL_HEIGHT,
  MARKER_SIZE,
  MAX_SHIFTS,
} from './chartConstants';

import type { SeriesMarker, SeriesTone } from './types';

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AnnotationGlyph {
  tone: SeriesTone;
  marker: SeriesMarker;
}

export interface AnnotationInput {
  key: string;
  seriesOrder: number;
  index: number;
  cx: number;
  cy: number;
  text: string;
  glyph: AnnotationGlyph;
}

export interface PlacedAnnotation {
  key: string;
  anchor: 'start' | 'end';
  box: { left: number; top: number; right: number; bottom: number };
  textX: number;
  textY: number;
  text: string;
  glyphs: readonly AnnotationGlyph[];
}

interface Merged {
  key: string;
  seriesOrder: number;
  index: number;
  cx: number;
  cy: number;
  text: string;
  glyphs: AnnotationGlyph[];
}

type Box = PlacedAnnotation['box'];

function intersects(a: Box, b: Box): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AvoidShapes {
  segments?: readonly Segment[];
  markers?: readonly { cx: number; cy: number }[];
}

function segmentHitsBox(seg: Segment, box: Box): boolean {
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  const p = [-dx, dx, -dy, dy];
  const q = [seg.x1 - box.left, box.right - seg.x1, seg.y1 - box.top, box.bottom - seg.y1];
  let t0 = 0;
  let t1 = 1;
  for (let k = 0; k < 4; k += 1) {
    const pk = p[k] ?? 0;
    const qk = q[k] ?? 0;
    if (pk === 0) {
      if (qk < 0) return false;
    } else {
      const t = qk / pk;
      if (pk < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

function hitsShapes(box: Box, avoid: AvoidShapes | undefined): boolean {
  if (!avoid) return false;
  const r = MARKER_SIZE / 2;
  const markerHit = (avoid.markers ?? []).some((m) =>
    intersects(box, { left: m.cx - r, right: m.cx + r, top: m.cy - r, bottom: m.cy + r })
  );
  return markerHit || (avoid.segments ?? []).some((seg) => segmentHitsBox(seg, box));
}

function compareInput(a: AnnotationInput, b: AnnotationInput): number {
  return (
    a.seriesOrder - b.seriesOrder ||
    a.index - b.index ||
    a.cy - b.cy ||
    (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  );
}

function merge(items: readonly AnnotationInput[]): Merged[] {
  const merged: Merged[] = [];
  for (const item of [...items].sort(compareInput)) {
    const twin = merged.find(
      (m) => m.index === item.index && m.text === item.text && Math.abs(m.cy - item.cy) < 1
    );
    if (twin) {
      twin.glyphs.push(item.glyph);
    } else {
      merged.push({ ...item, glyphs: [item.glyph] });
    }
  }
  return merged;
}

export function layoutAnnotations(
  items: readonly AnnotationInput[],
  area: { plot: Rect; bounds: Rect; avoid?: AvoidShapes }
): PlacedAnnotation[] {
  const { plot, bounds, avoid } = area;
  const boundsRight = bounds.left + bounds.width;
  const boundsBottom = bounds.top + bounds.height;
  const h = LABEL_HEIGHT;

  const sorted = merge(items).sort(
    (a, b) => a.cy - b.cy || a.seriesOrder - b.seriesOrder || a.index - b.index
  );
  const placedBoxes: Box[] = [];

  return sorted.map((item) => {
    const w = item.glyphs.length * GLYPH_SLOT + item.text.length * CHAR_WIDTH;
    const preferred = item.cx > plot.left + END_ANCHOR_FROM * plot.width ? 'end' : 'start';
    const leftFor = (side: 'start' | 'end') => {
      const rawLeft = side === 'start' ? item.cx + LABEL_GAP : item.cx - LABEL_GAP - w;
      return Math.max(bounds.left, Math.min(rawLeft, boundsRight - w));
    };

    const above = item.cy - LABEL_GAP - h / 2;
    const below = item.cy + LABEL_GAP + h / 2;
    const candidates: number[] = [];
    for (let s = 0; s <= MAX_SHIFTS; s += 1) {
      candidates.push(above - s * h, below + s * h);
    }

    const boxAt = (center: number, left: number): Box => ({
      left,
      right: left + w,
      top: center - h / 2,
      bottom: center + h / 2,
    });
    const inside = (box: Box) => box.top >= bounds.top && box.bottom <= boundsBottom;
    const freeOfLabels = (box: Box) => inside(box) && !placedBoxes.some((o) => intersects(box, o));

    const other = preferred === 'start' ? 'end' : 'start';
    let anchor: 'start' | 'end' = preferred;
    let left = leftFor(preferred);
    let textY: number | undefined;
    for (const side of [preferred, other] as const) {
      const sideLeft = leftFor(side);
      const found = candidates.find((c) => {
        const box = boxAt(c, sideLeft);
        return freeOfLabels(box) && !hitsShapes(box, avoid);
      });
      if (found !== undefined) {
        anchor = side;
        left = sideLeft;
        textY = found;
        break;
      }
    }
    if (textY === undefined) {
      left = leftFor(preferred);
      anchor = preferred;
      const free = candidates.find((c) => freeOfLabels(boxAt(c, left)));
      const insideOnly = candidates.find((c) => inside(boxAt(c, left)));
      const clamped = Math.max(bounds.top + h / 2, Math.min(above, boundsBottom - h / 2));
      textY = free ?? insideOnly ?? clamped;
    }

    const box = boxAt(textY, left);
    placedBoxes.push(box);

    return {
      key: item.key,
      anchor,
      box,
      textX: box.left + item.glyphs.length * GLYPH_SLOT,
      textY,
      text: item.text,
      glyphs: item.glyphs,
    };
  });
}
