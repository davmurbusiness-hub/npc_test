import cn from 'classnames';

import styles from './DataTable.module.scss';

import type { ReactNode } from 'react';

export type DataTableAlign = 'start' | 'end';
export type DataTableCaptionVisibility = 'visible' | 'hidden';
export type DataTableNarrowLayout = 'scroll' | 'stack';

export interface DataTableColumn<T> {
  key: string;
  header: string;

  align?: DataTableAlign;

  render: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  caption: string;

  captionVisibility?: DataTableCaptionVisibility;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];

  getRowKey: (row: T, index: number) => string;

  emptyText?: string;

  narrowLayout?: DataTableNarrowLayout;

  className?: string;
}

export function DataTable<T>({
  caption,
  captionVisibility = 'visible',
  columns,
  rows,
  getRowKey,
  emptyText = 'Нет данных',
  narrowLayout = 'scroll',
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(styles.root, narrowLayout === 'stack' && styles.stack, className)}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption
          className={cn(styles.caption, captionVisibility === 'hidden' && styles.captionHidden)}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(styles.th, column.align === 'end' ? styles.end : styles.start)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className={cn(styles.td, styles.empty)}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(styles.td, column.align === 'end' ? styles.end : styles.start)}
                    data-label={column.header}
                  >
                    {column.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
