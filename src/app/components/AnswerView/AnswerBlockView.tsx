import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import { NoData } from 'components/NoData';
import { Text } from 'components/Text';
import type { AnswerBlock, ChartBlock, TableBlock, TableCell } from 'types/models';
import { formatNumber } from 'utils/formatNumber';

import styles from './AnswerBlockView.module.scss';

import type { ReactNode } from 'react';

export interface AnswerBlockViewProps {
  block: AnswerBlock;
}

const CATEGORY_HEADER = 'Показатель';
const CHART_NOTE = 'График показан таблицей';
const TABLE_CAPTION = 'Таблица';
const CHART_CAPTION = 'График';

function getRowKey(_row: unknown, index: number): string {
  return String(index);
}

function captionOf(title: string, fallback: string): string {
  return typeof title === 'string' && title.trim() !== '' ? title : fallback;
}

function presentCell(cell: TableCell | undefined): string | number | null {
  if (typeof cell === 'string') return cell;
  if (typeof cell === 'number' && Number.isFinite(cell)) return cell;
  return null;
}

function renderCell(cell: TableCell | undefined): ReactNode {
  const value = presentCell(cell);
  if (typeof value === 'string') return value;

  return formatNumber(value, 'decimal') ?? <NoData />;
}

function isNumericColumn(rows: readonly (readonly TableCell[])[], index: number): boolean {
  const values = rows.map((row) => presentCell(row[index])).filter((value) => value !== null);
  return values.length > 0 && values.every((value) => typeof value === 'number');
}

function tableHasData({ columns, rows }: TableBlock): boolean {
  return rows.some((row) => columns.some((_header, index) => presentCell(row[index]) !== null));
}

function chartHasData({ categories, series }: ChartBlock): boolean {
  return series.some(({ values }) =>
    categories.some((_category, index) => presentCell(values[index]) !== null)
  );
}

function TableView({ block }: { block: TableBlock }) {
  const columns = block.columns.map((header, index): DataTableColumn<TableCell[]> => ({
    key: `column-${String(index)}`,
    header,
    align: isNumericColumn(block.rows, index) ? 'end' : 'start',
    render: (row) => renderCell(row[index]),
  }));

  return (
    <div className={styles.root}>
      <DataTable
        caption={captionOf(block.title, TABLE_CAPTION)}
        columns={columns}
        rows={block.rows}
        getRowKey={getRowKey}
        narrowLayout="stack"
      />
    </div>
  );
}

function ChartView({ block }: { block: ChartBlock }) {
  const seriesColumns = block.series.map((series, seriesIndex): DataTableColumn<string> => ({
    key: `series-${String(seriesIndex)}`,
    header: series.name,
    align: 'end',
    render: (_category, categoryIndex) => renderCell(series.values[categoryIndex]),
  }));
  const columns: DataTableColumn<string>[] = [
    { key: 'category', header: CATEGORY_HEADER, align: 'start', render: (category) => category },
    ...seriesColumns,
  ];

  return (
    <div className={styles.root}>
      <DataTable
        caption={captionOf(block.title, CHART_CAPTION)}
        columns={columns}
        rows={block.categories}
        getRowKey={getRowKey}
        narrowLayout="stack"
      />
      <Text size="xs" color="tertiary" wrap="normal" className={styles.note}>
        {CHART_NOTE}
      </Text>
    </div>
  );
}

export function AnswerBlockView({ block }: AnswerBlockViewProps) {
  switch (block.type) {
    case 'table':
      return tableHasData(block) ? <TableView block={block} /> : null;
    case 'chart':
      return chartHasData(block) ? <ChartView block={block} /> : null;
    case 'unsupported':
    default:
      return null;
  }
}
