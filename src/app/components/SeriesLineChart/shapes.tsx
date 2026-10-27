import cn from 'classnames';

import { MARKER_SIZE } from './chartConstants';
import { finite } from './chartData';
import styles from './SeriesLineChart.module.scss';

import type { SeriesLineStyle, SeriesMarker, SeriesTone } from './types';

interface MarkerShapeProps {
  cx: number | undefined;
  cy: number | undefined;
  marker: SeriesMarker;
  tone: SeriesTone;
}

export function MarkerShape({ cx, cy, marker, tone }: MarkerShapeProps) {
  if (!finite(cx) || !finite(cy)) return null;
  const className = cn(styles.marker, styles[tone]);
  return marker === 'square' ? (
    <rect
      x={cx - MARKER_SIZE / 2}
      y={cy - MARKER_SIZE / 2}
      width={MARKER_SIZE}
      height={MARKER_SIZE}
      className={className}
    />
  ) : (
    <circle cx={cx} cy={cy} r={MARKER_SIZE / 2} className={className} />
  );
}

interface SeriesSwatchProps {
  tone: SeriesTone;
  lineStyle: SeriesLineStyle;
  marker: SeriesMarker;
}

export function SeriesSwatch({ tone, lineStyle, marker }: SeriesSwatchProps) {
  return (
    <span className={cn(styles.swatch, styles[tone])} aria-hidden="true">
      <span className={cn(styles.sample, lineStyle === 'dashed' && styles.dashed)} />
      <span className={cn(styles.sampleMarker, styles[marker])} />
    </span>
  );
}
