import cn from 'classnames';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import type { CollectionMonth } from 'types/dashboard';
import { formatMoney, formatPercent, formatMonth } from 'utils/format';

import styles from './CollectionChart.module.scss';
import { CollectionTooltip } from './CollectionTooltip';

export type CollectionView = 'chart' | 'table';

export interface CollectionChartProps {
  months: readonly CollectionMonth[];
  view: CollectionView;
  className?: string;
}

const COLOR = {
  rate: 'var(--chart-bar)',
  charged: 'var(--chart-ordinal-3)',
  paid: 'var(--chart-ordinal-1)',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  surface: 'var(--color-bg-surface)',
  text: 'var(--color-text-secondary)',
} as const;

const TICK = { fill: COLOR.text, fontSize: 12 };
const SYNC_ID = 'dashboard-collection';
const Y_AXIS_WIDTH = 72;

const COLUMNS: readonly DataTableColumn<CollectionMonth>[] = [
  { key: 'period', header: 'Месяц', render: (row) => formatMonth(row.period, 'full') },
  { key: 'charged', header: 'К оплате', align: 'end', render: (row) => formatMoney(row.charged) },
  {
    key: 'paid',
    header: 'Оплачено в срок',
    align: 'end',
    render: (row) => formatMoney(row.paidOnTime),
  },
  { key: 'rate', header: 'Собираемость', align: 'end', render: (row) => formatPercent(row.rate) },
];

function rateTicks(months: readonly CollectionMonth[]): number[] {
  const rates = months.flatMap((month) => (month.rate === null ? [] : [month.rate]));
  if (rates.length === 0) return [0, 50, 100];
  const min = Math.max(0, Math.floor(Math.min(...rates)) - 1);
  const max = Math.min(100, Math.ceil(Math.max(...rates)) + 1);
  const step = Math.max(1, Math.ceil((max - min) / 4));
  const ticks = [min];
  while ((ticks.at(-1) ?? max) < max) ticks.push(Math.min(100, (ticks.at(-1) ?? min) + step));
  return ticks;
}

export function CollectionChart({ months, view, className }: CollectionChartProps) {
  if (view === 'table') {
    return (
      <DataTable
        caption="Собираемость по месяцам"
        captionVisibility="hidden"
        columns={COLUMNS}
        rows={months}
        getRowKey={(row) => row.period}
        className={className}
      />
    );
  }

  const ticks = rateTicks(months);
  const rows = months.map((month) => ({ ...month, label: formatMonth(month.period, 'short') }));
  const last = months.at(-1);
  const summary = last
    ? `Собираемость за ${formatMonth(last.period, 'full')}: ${formatPercent(last.rate)}. ` +
      `Наименьшая за период: ${formatPercent(Math.min(...months.map((m) => m.rate ?? 100)))}.`
    : '';

  return (
    <figure className={cn(styles.root, className)}>
      <figcaption className={styles.srOnly}>{summary}</figcaption>
      <p className={styles.panelTitle}>Оплачено в срок, % от начисленного</p>
      <div className={styles.ratePlot}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={rows}
            syncId={SYNC_ID}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={COLOR.grid} />
            <XAxis dataKey="label" hide />
            <YAxis
              domain={[ticks[0] ?? 0, ticks.at(-1) ?? 100]}
              ticks={ticks}
              tickFormatter={(value: number) => `${value} %`}
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={CollectionTooltip} cursor={{ stroke: COLOR.axis }} />
            <Line
              dataKey="rate"
              stroke={COLOR.rate}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              dot={{ r: 4, fill: COLOR.rate, stroke: COLOR.surface, strokeWidth: 2 }}
              activeDot={{ r: 5, fill: COLOR.rate, stroke: COLOR.surface, strokeWidth: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.panelHead}>
        <p className={styles.panelTitle}>Суммы, ₽</p>
        <ul className={styles.legend}>
          <li>
            <span className={cn(styles.swatch, styles.charged)} aria-hidden="true" />К оплате
          </li>
          <li>
            <span className={cn(styles.swatch, styles.paid)} aria-hidden="true" />
            Оплачено в срок
          </li>
        </ul>
      </div>
      <div className={styles.amountPlot}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            syncId={SYNC_ID}
            barGap={2}
            margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={COLOR.grid} />
            <XAxis
              dataKey="label"
              tick={TICK}
              tickLine={false}
              axisLine={{ stroke: COLOR.axis }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(value: number) => formatMoney(value, true)}
              tick={TICK}
              tickLine={false}
              axisLine={false}
              width={Y_AXIS_WIDTH}
            />
            <Tooltip content={CollectionTooltip} cursor={{ fill: COLOR.grid, opacity: 0.4 }} />
            <Bar
              dataKey="charged"
              fill={COLOR.charged}
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="paidOnTime"
              fill={COLOR.paid}
              maxBarSize={24}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
