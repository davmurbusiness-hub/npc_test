import cn from 'classnames';
import { memo, useState } from 'react';

import { Button } from 'components/Button';
import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import { NoData } from 'components/NoData';
import { NumberText } from 'components/NumberText';
import { SegmentedControl } from 'components/SegmentedControl';
import type { SegmentedOption } from 'components/SegmentedControl';
import { Text } from 'components/Text';
import type { ButterflyRow } from 'types/transactions';

import styles from './ButterflyChart.module.scss';

import type { CSSProperties } from 'react';

export type { ButterflyRow } from 'types/transactions';

export interface ButterflyChartProps {
  rows: readonly ButterflyRow[];

  leftLabel: string;

  rightLabel: string;

  labelHeader: string;

  caption: string;

  activeId?: string | null;

  onSelect?: (id: string) => void;

  selectLabel?: string;
  className?: string;
}

type ButterflyView = 'chart' | 'table';

const VIEW_OPTIONS: readonly SegmentedOption<ButterflyView>[] = [
  { value: 'chart', label: 'График' },
  { value: 'table', label: 'Таблица' },
];

type RowStyle = CSSProperties & Record<'--left-share' | '--right-share', string>;

function barValue(value: number | null): number {
  return value !== null && Number.isFinite(value) && value > 0 ? value : 0;
}

function getRowKey(row: ButterflyRow): string {
  return row.id;
}

function shareOf(value: number | null, max: number): number {
  return max > 0 ? barValue(value) / max : 0;
}

export const ButterflyChart = memo(function ButterflyChart({
  rows,
  leftLabel,
  rightLabel,
  labelHeader,
  caption,
  activeId = null,
  onSelect,
  selectLabel,
  className,
}: ButterflyChartProps) {
  const [view, setView] = useState<ButterflyView>('chart');

  if (rows.length === 0) return <NoData className={className} />;

  const max = rows.reduce((acc, row) => Math.max(acc, barValue(row.left), barValue(row.right)), 0);

  const rowName = (row: ButterflyRow) => {
    const title = row.title ?? undefined;
    if (!onSelect) {
      return (
        <Text as="span" size="sm" wrap="normal" title={title}>
          {row.label}
        </Text>
      );
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        title={title}
        aria-current={row.id === activeId ? 'true' : undefined}
        aria-label={selectLabel ? `${selectLabel} ${row.title ?? row.label}` : undefined}
        onClick={() => {
          onSelect(row.id);
        }}
      >
        {row.label}
      </Button>
    );
  };

  const columns: readonly DataTableColumn<ButterflyRow>[] = [
    { key: 'label', header: labelHeader, render: rowName },
    {
      key: 'left',
      header: leftLabel,
      align: 'end',
      render: (row) => <NumberText value={row.left} format="money" />,
    },
    {
      key: 'right',
      header: rightLabel,
      align: 'end',
      render: (row) => <NumberText value={row.right} format="money" />,
    },
  ];

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
        <div role="group" aria-label={caption} className={styles.chart}>
          <div className={styles.head} aria-hidden="true">
            <span>{leftLabel}</span>
            <span />
            <span>{rightLabel}</span>
          </div>
          <ul className={styles.rows}>
            {rows.map((row) => {
              const style: RowStyle = {
                '--left-share': String(shareOf(row.left, max)),
                '--right-share': String(shareOf(row.right, max)),
              };

              return (
                <li
                  key={row.id}
                  className={cn(styles.row, row.id === activeId && styles.active)}
                  aria-current={row.id === activeId ? 'true' : undefined}
                  style={style}
                >
                  <span className={styles.name}>{rowName(row)}</span>
                  <span className={cn(styles.side, styles.left)}>
                    <span className={styles.value}>
                      <span className={styles.srOnly}>{leftLabel}: </span>
                      <NumberText value={row.left} format="money" notation="compact" />
                    </span>
                    <span className={styles.track} aria-hidden="true">
                      {barValue(row.left) > 0 && (
                        <span className={cn(styles.bar, styles.barLeft)} />
                      )}
                    </span>
                  </span>
                  <span className={cn(styles.side, styles.right)}>
                    <span className={styles.track} aria-hidden="true">
                      {barValue(row.right) > 0 && (
                        <span className={cn(styles.bar, styles.barRight)} />
                      )}
                    </span>
                    <span className={styles.value}>
                      <span className={styles.srOnly}>{rightLabel}: </span>
                      <NumberText value={row.right} format="money" notation="compact" />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <DataTable
          caption={caption}
          columns={columns}
          rows={rows}
          getRowKey={getRowKey}
          narrowLayout="stack"
        />
      )}
    </div>
  );
});
