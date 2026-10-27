import {
  DefaultZIndexes,
  useChartHeight,
  useChartWidth,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  ZIndexLayer,
} from 'recharts';

import { formatNumber } from 'utils/formatNumber';
import type { NumberFormat } from 'utils/formatNumber';

import { GLYPH_SLOT, MARKER_SIZE } from './chartConstants';
import { finite } from './chartData';
import { layoutAnnotations } from './layoutAnnotations';
import styles from './SeriesLineChart.module.scss';
import { MarkerShape } from './shapes';

import type { AnnotationPoint, ChartRow } from './chartData';
import type { AnnotationInput, Segment } from './layoutAnnotations';

interface AnnotationLayerProps {
  points: readonly AnnotationPoint[];
  yFormat: NumberFormat;

  rows: readonly ChartRow[];
  keys: readonly string[];
}

export function AnnotationLayer({ points, yFormat, rows, keys }: AnnotationLayerProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const plot = usePlotArea();
  const width = useChartWidth();
  const height = useChartHeight();

  if (!xScale || !yScale || !plot || width === undefined || height === undefined) return null;

  const placed: { input: AnnotationInput; point: AnnotationPoint }[] = [];
  for (const point of points) {
    const cx = xScale(point.xValue);
    const cy = yScale(point.yValue);
    if (!finite(cx) || !finite(cy)) continue;
    placed.push({
      point,
      input: {
        key: point.key,
        seriesOrder: point.seriesOrder,
        index: point.index,
        cx,
        cy,
        text: `${point.caption} ${formatNumber(point.value, yFormat) ?? 'нет данных'}`,
        glyph: { tone: point.tone, marker: point.marker },
      },
    });
  }

  const segments: Segment[] = [];
  for (const key of keys) {
    let prev: { x: number; y: number } | null = null;
    for (const row of rows) {
      const px = xScale(row.x);
      const value = row[key];
      const py = finite(value) ? yScale(value) : undefined;
      if (!finite(px) || !finite(py)) {
        prev = null;
        continue;
      }
      if (prev) segments.push({ x1: prev.x, y1: prev.y, x2: px, y2: py });
      prev = { x: px, y: py };
    }
  }

  const layout = layoutAnnotations(
    placed.map((item) => item.input),
    {
      plot: { left: plot.x, top: plot.y, width: plot.width, height: plot.height },
      bounds: { left: 0, top: 0, width, height },
      avoid: { segments, markers: placed.map(({ input }) => ({ cx: input.cx, cy: input.cy })) },
    }
  );

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label}>
      <g className={styles.points}>
        {placed.map(({ input, point }) => (
          <MarkerShape
            key={input.key}
            cx={input.cx}
            cy={input.cy}
            tone={point.tone}
            marker={point.marker}
          />
        ))}
      </g>
      <g>
        {layout.map((label) => (
          <g key={label.key} className={styles.annotation}>
            {label.glyphs.map((glyph, j) => (
              <MarkerShape
                key={`${glyph.tone}:${glyph.marker}:${j}`}
                cx={label.box.left + j * GLYPH_SLOT + MARKER_SIZE / 2}
                cy={label.textY}
                tone={glyph.tone}
                marker={glyph.marker}
              />
            ))}
            <text
              className={styles.annotationText}
              x={label.textX}
              y={label.textY}
              dominantBaseline="middle"
            >
              {label.text}
            </text>
          </g>
        ))}
      </g>
    </ZIndexLayer>
  );
}
