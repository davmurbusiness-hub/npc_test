import { NumberText } from 'components/NumberText';
import type { NumberFormat } from 'components/NumberText';

import { readLook, seriesKey, valueAt } from './chartData';
import styles from './SeriesLineChart.module.scss';
import { SeriesSwatch } from './shapes';

import type { LineSeries } from './types';

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: readonly { payload?: unknown }[] | undefined;
  series: readonly LineSeries[];
  x: readonly number[];
  xLabel: string;
  xFormat: NumberFormat;
  yFormat: NumberFormat;
}

function rowIndex(payload: ChartTooltipProps['payload']): number | null {
  const row = payload?.[0]?.payload;
  if (typeof row !== 'object' || row === null || !('index' in row)) return null;
  return typeof row.index === 'number' ? row.index : null;
}

export function ChartTooltip({
  active,
  payload,
  series,
  x,
  xLabel,
  xFormat,
  yFormat,
}: ChartTooltipProps) {
  const index = rowIndex(payload);
  if (!active || index === null) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>
        {xLabel}: <NumberText value={x[index] ?? null} format={xFormat} />
      </p>
      <ul className={styles.tooltipList}>
        {series.map((line, i) => (
          <li key={seriesKey(line, i)} className={styles.tooltipItem}>
            <SeriesSwatch {...readLook(line)} />
            <span>{line.label}</span>
            <NumberText value={valueAt(line, index)} format={yFormat} />
          </li>
        ))}
      </ul>
    </div>
  );
}
