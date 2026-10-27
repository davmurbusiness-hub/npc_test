import cn from 'classnames';
import { memo, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DataTable } from 'components/DataTable';
import { NumberText } from 'components/NumberText';
import type { NumberFormat } from 'components/NumberText';
import { SegmentedControl } from 'components/SegmentedControl';
import { Text } from 'components/Text';
import { formatNumber } from 'utils/formatNumber';

import { AnnotationLayer } from './AnnotationLayer';
import { CHART_MARGIN, DASH, STROKE_WIDTH, TICK_GAP } from './chartConstants';
import {
  annotationPoints,
  buildRows,
  dataKey,
  finite,
  hasAnyData,
  isDrawn,
  readDomain,
  isIsolated,
  readLook,
  seriesKey,
  valueAt,
} from './chartData';
import { ChartTooltip } from './ChartTooltip';
import styles from './SeriesLineChart.module.scss';
import { MarkerShape, SeriesSwatch } from './shapes';

import type { LineSeries } from './types';

export type {
  LineSeries,
  SeriesAnnotation,
  SeriesLineStyle,
  SeriesMarker,
  SeriesTone,
} from './types';

export interface SeriesLineChartProps {
  series: readonly LineSeries[];

  x: readonly number[];

  xLabel: string;

  yLabel: string;
  xFormat?: NumberFormat;

  yFormat?: NumberFormat;

  yDomain?: readonly [number, number] | null;

  caption: string;

  emptyText?: string;
  className?: string;
}

type View = 'chart' | 'table';

const VIEW_OPTIONS = [
  { value: 'chart', label: 'График' },
  { value: 'table', label: 'Таблица' },
] as const satisfies readonly { value: View; label: string }[];

const MAX_AUTO_TICKS = 6;

interface AxisTickProps {
  x: number | string;
  y: number | string;
  payload: { value?: unknown };

  className?: string;
  axis: 'x' | 'y';
  format: NumberFormat;
}

function AxisTick({ x, y, payload, className, axis, format }: AxisTickProps) {
  const text = formatNumber(finite(payload.value) ? payload.value : null, format, {
    notation: 'compact',
  });
  const numericY = Number(y);
  return (
    <text
      x={x}
      y={axis === 'x' && Number.isFinite(numericY) ? numericY + TICK_GAP : y}
      textAnchor={axis === 'x' ? 'middle' : 'end'}
      dominantBaseline={axis === 'x' ? 'hanging' : 'middle'}
      className={cn(styles.tick, className)}
    >
      {text ?? ''}
    </text>
  );
}

export const SeriesLineChart = memo(function SeriesLineChart({
  series,
  x,
  xLabel,
  yLabel,
  xFormat = 'count',
  yFormat = 'count',
  yDomain = null,
  caption,
  emptyText = 'Нет данных',
  className,
}: SeriesLineChartProps) {
  const [view, setView] = useState<View>('chart');

  const hasData = useMemo(() => hasAnyData(x, series), [x, series]);
  const domain = useMemo(() => readDomain(yDomain), [yDomain]);
  const rows = useMemo(() => buildRows(x, series, domain), [x, series, domain]);
  const drawn = useMemo(
    () => series.map((line, i) => ({ line, i })).filter(({ line }) => isDrawn(x, line, domain)),
    [x, series, domain]
  );
  const points = useMemo(() => annotationPoints(x, drawn, domain), [x, drawn, domain]);
  const columns = useMemo(
    () => [
      {
        key: 'x',
        header: xLabel,
        align: 'end' as const,
        render: (k: number) => <NumberText value={finite(x[k]) ? x[k] : null} format={xFormat} />,
      },
      ...series.map((line, i) => ({
        key: seriesKey(line, i),
        header: line.label,
        align: 'end' as const,
        render: (k: number) => <NumberText value={valueAt(line, k)} format={yFormat} />,
      })),
    ],
    [x, series, xLabel, xFormat, yFormat]
  );

  if (!hasData) {
    return (
      <div className={cn(styles.root, className)}>
        <Text as="p" size="sm" color="secondary" wrap="normal">
          {emptyText}
        </Text>
      </div>
    );
  }

  const drawnIndexes = new Set(drawn.map(({ i }) => i));

  const finiteX = x.filter(finite);
  const [firstX] = finiteX;
  const singlePoint = finiteX.length === 1 && firstX !== undefined;
  const xDomain: [number | string, number | string] = singlePoint
    ? [firstX - 1, firstX + 1]
    : ['dataMin', 'dataMax'];
  const xTicks = singlePoint ? [firstX] : finiteX.length <= MAX_AUTO_TICKS ? finiteX : undefined;

  return (
    <div className={cn(styles.root, className)}>
      <SegmentedControl
        label="Вид данных"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        className={styles.switch}
      />

      {view === 'chart' ? (
        <div role="group" aria-label={caption} className={styles.figure}>
          <Text as="p" size="xs" color="tertiary" wrap="normal">
            {yLabel}
          </Text>
          <div className={styles.plot} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={CHART_MARGIN} accessibilityLayer={false}>
                <CartesianGrid vertical={false} stroke="currentColor" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={xDomain}
                  ticks={xTicks}
                  tickCount={MAX_AUTO_TICKS}
                  allowDecimals={xFormat !== 'count'}
                  axisLine={false}
                  tickLine={false}
                  tick={(p) => (
                    <AxisTick
                      x={p.x}
                      y={p.y}
                      payload={p.payload}
                      className={p.className}
                      axis="x"
                      format={xFormat}
                    />
                  )}
                />
                <YAxis
                  type="number"
                  domain={domain ?? ['auto', 'auto']}
                  allowDataOverflow={domain !== null}
                  tickCount={5}
                  width="auto"
                  axisLine={false}
                  tickLine={false}
                  tick={(p) => (
                    <AxisTick
                      x={p.x}
                      y={p.y}
                      payload={p.payload}
                      className={p.className}
                      axis="y"
                      format={yFormat}
                    />
                  )}
                />
                <Tooltip
                  content={(p) => (
                    <ChartTooltip
                      active={p.active}
                      payload={p.payload}
                      series={series}
                      x={x}
                      xLabel={xLabel}
                      xFormat={xFormat}
                      yFormat={yFormat}
                    />
                  )}
                  cursor={{ stroke: 'currentColor', strokeWidth: 1 }}
                  isAnimationActive="auto"
                />
                {drawn.map(({ line, i }) => {
                  const look = readLook(line);
                  return (
                    <Line
                      key={seriesKey(line, i)}
                      dataKey={dataKey(i)}
                      name={line.label}
                      type="linear"
                      className={cn(styles.series, styles[look.tone])}
                      stroke="currentColor"
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={look.lineStyle === 'dashed' ? DASH : undefined}
                      dot={(p) =>
                        isIsolated(rows, dataKey(i), p.index) ? (
                          <MarkerShape
                            key={p.index}
                            cx={p.cx}
                            cy={p.cy}
                            marker={look.marker}
                            tone={look.tone}
                          />
                        ) : null
                      }
                      activeDot={(p) => (
                        <MarkerShape cx={p.cx} cy={p.cy} marker={look.marker} tone={look.tone} />
                      )}
                      connectNulls={false}
                      legendType="none"
                      isAnimationActive={false}
                    />
                  );
                })}
                <AnnotationLayer
                  points={points}
                  yFormat={yFormat}
                  rows={rows}
                  keys={drawn.map(({ i }) => dataKey(i))}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Text as="p" size="xs" color="tertiary" wrap="normal">
            {xLabel}
          </Text>
        </div>
      ) : (
        <DataTable
          caption={caption}
          columns={columns}
          rows={Array.from({ length: x.length }, (_, k) => k)}
          getRowKey={(k) => String(k)}
          narrowLayout="stack"
        />
      )}

      <ul className={styles.legend} role="list">
        {series.map((line, i) => (
          <li key={seriesKey(line, i)} className={styles.legendItem}>
            <SeriesSwatch {...readLook(line)} />
            <span>{line.label}</span>
            {drawnIndexes.has(i) ? (
              line.annotations.length > 0 && (
                <span className={styles.legendValues}>
                  {line.annotations.map((annotation, j) => (
                    <span key={j}>
                      {j > 0 && ', '}
                      {annotation.caption} <NumberText value={annotation.value} format={yFormat} />
                    </span>
                  ))}
                </span>
              )
            ) : (
              <span className={styles.legendValues}>{emptyText}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});
