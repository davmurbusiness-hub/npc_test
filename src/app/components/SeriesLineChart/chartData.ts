import { pickOwn } from 'utils/pickOwn';

import type { LineSeries, SeriesLineStyle, SeriesMarker, SeriesTone } from './types';

export function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export type YBounds = readonly [number, number];

export function readDomain(yDomain: readonly [number, number] | null | undefined): YBounds | null {
  if (!yDomain) return null;
  const min: unknown = yDomain[0];
  const max: unknown = yDomain[1];
  return finite(min) && finite(max) && min < max ? [min, max] : null;
}

export function plotValue(value: unknown, domain: YBounds | null): number | null {
  if (!finite(value)) return null;
  return domain ? Math.min(Math.max(value, domain[0]), domain[1]) : value;
}

export function valueAt(line: LineSeries, k: number): number | null {
  const value: unknown = line.values[k];
  return finite(value) ? value : null;
}

export function seriesKey(line: LineSeries, i: number): string {
  return `${line.id}:${i}`;
}

export function dataKey(i: number): string {
  return `s${i}`;
}

export type ChartRow = Record<string, number | null>;

export function buildRows(
  x: readonly number[],
  series: readonly LineSeries[],
  domain: YBounds | null
): ChartRow[] {
  const rows: ChartRow[] = [];
  x.forEach((xValue, k) => {
    if (!finite(xValue)) return;
    const row: ChartRow = { index: k, x: xValue };
    series.forEach((line, i) => {
      row[dataKey(i)] = plotValue(line.values[k], domain);
    });
    rows.push(row);
  });
  return rows;
}

export function isIsolated(rows: readonly ChartRow[], key: string, index: number): boolean {
  const own = rows[index]?.[key];
  if (own === null || own === undefined) return false;
  return (rows[index - 1]?.[key] ?? null) === null && (rows[index + 1]?.[key] ?? null) === null;
}

export function hasAnyData(x: readonly number[], series: readonly LineSeries[]): boolean {
  return x.some((xValue, k) => finite(xValue) && series.some((line) => valueAt(line, k) !== null));
}

export function isDrawn(x: readonly number[], line: LineSeries, domain: YBounds | null): boolean {
  return x.some((xValue, k) => finite(xValue) && plotValue(line.values[k], domain) !== null);
}

const TONES: Partial<Record<string, SeriesTone>> = { incoming: 'incoming', outgoing: 'outgoing' };
const LINE_STYLES: Partial<Record<string, SeriesLineStyle>> = { solid: 'solid', dashed: 'dashed' };
const MARKERS: Partial<Record<string, SeriesMarker>> = { circle: 'circle', square: 'square' };

export function readLook(line: LineSeries): {
  tone: SeriesTone;
  lineStyle: SeriesLineStyle;
  marker: SeriesMarker;
} {
  return {
    tone: pickOwn(TONES, String(line.tone), 'incoming'),
    lineStyle: pickOwn(LINE_STYLES, String(line.lineStyle), 'solid'),
    marker: pickOwn(MARKERS, String(line.marker), 'circle'),
  };
}

export interface AnnotationPoint {
  key: string;
  seriesOrder: number;
  index: number;
  xValue: number;
  yValue: number;
  caption: string;
  value: number | null;
  tone: SeriesTone;
  marker: SeriesMarker;
}

export function annotationPoints(
  x: readonly number[],
  drawn: readonly { line: LineSeries; i: number }[],
  domain: YBounds | null
): AnnotationPoint[] {
  const points: AnnotationPoint[] = [];
  for (const { line, i } of drawn) {
    const { tone, marker } = readLook(line);
    line.annotations.forEach((annotation, j) => {
      const { index } = annotation;
      if (!Number.isInteger(index) || index < 0 || index >= x.length) return;
      const xValue = x[index];
      const yValue = plotValue(line.values[index], domain);
      if (!finite(xValue) || yValue === null) return;
      points.push({
        key: `${i}:${j}`,
        seriesOrder: i,
        index,
        xValue,
        yValue,
        caption: annotation.caption,
        value: annotation.value,
        tone,
        marker,
      });
    });
  }
  return points;
}
