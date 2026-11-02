import {
  createColumnHelper,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import cn from 'classnames';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { labelOf, formatBenefitCategory } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { NumberText } from 'components/NumberText';
import { Skeleton } from 'components/Skeleton';
import type { SkeletonProps } from 'components/Skeleton';
import type { CitizenId, IsoDate } from 'types/common';
import type { CitizenRow, SortField, SortState } from 'types/registry';
import { formatMasked } from 'utils/masks';
import { STATUS_TONE } from 'utils/ui';

import styles from './CitizenTable.module.scss';

import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import type { CSSProperties, KeyboardEvent } from 'react';

export interface CitizenTableProps {
  rows: readonly CitizenRow[];
  loading: boolean;
  refreshing?: boolean;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selectedId: CitizenId | null;
  onSelect: (id: CitizenId) => void;
  onOpen: (id: CitizenId) => void;
  className?: string;
}

type CellAlign = 'start' | 'end';

interface CitizenColumnMeta {
  minWidth: number;
  grow: number;
  align?: CellAlign;
}

type GridStyle = CSSProperties &
  Record<'--citizen-table-columns' | '--citizen-table-min-width', string>;

const features = tableFeatures({
  rowSortingFeature,
  columnMeta: {} as CitizenColumnMeta,
});

const column = createColumnHelper<typeof features, CitizenRow>();

const SKELETON_ROWS = 12;

const ROW_HEIGHT_ESTIMATE = 44;

const OVERSCAN = 8;

const SKELETON_WIDTHS: readonly NonNullable<SkeletonProps['width']>[] = [
  '80%',
  '90%',
  '75%',
  '40%',
  '85%',
  '70%',
  '60%',
  '65%',
  '55%',
  '75%',
];

function formatDate(iso: IsoDate): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

function Dash() {
  return <span className={styles.muted}>—</span>;
}

function textOrDash(text: string) {
  return text === '' ? <Dash /> : text;
}

const columns = column.columns([
  column.accessor('cardNumber', {
    header: '№ карточки',
    meta: { minWidth: 136, grow: 0 },
  }),
  column.accessor('fullName', {
    header: 'ФИО',
    meta: { minWidth: 240, grow: 2 },
    cell: (info) => (
      <span className={styles.name} title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  column.accessor('birthDate', {
    header: 'Дата рождения',
    meta: { minWidth: 168, grow: 0 },
    cell: (info) => <span className={styles.numeric}>{formatDate(info.getValue())}</span>,
  }),
  column.accessor('age', {
    header: 'Возраст',
    meta: { minWidth: 104, grow: 0, align: 'end' },
    cell: (info) => <span className={styles.numeric}>{info.getValue()}</span>,
  }),
  column.accessor('mobilePhone', {
    header: 'Телефон',
    meta: { minWidth: 168, grow: 0 },
    cell: (info) => (
      <span className={styles.numeric}>{textOrDash(formatMasked('phone', info.getValue()))}</span>
    ),
  }),
  column.accessor('districtId', {
    header: 'Район',
    meta: { minWidth: 152, grow: 1 },
    cell: (info) => textOrDash(labelOf('district', info.getValue())),
  }),
  column.accessor('status', {
    header: 'Статус',
    meta: { minWidth: 132, grow: 0 },
    cell: (info) => (
      <Badge tone={STATUS_TONE[info.getValue()]}>{labelOf('cardStatus', info.getValue())}</Badge>
    ),
  }),
  column.accessor('benefitCategory', {
    header: 'Льготная категория',
    enableSorting: false,
    meta: { minWidth: 184, grow: 1 },
    cell: (info) => textOrDash(formatBenefitCategory(info.getValue())),
  }),
  column.accessor('debt', {
    header: 'Задолженность',
    sortDescFirst: true,
    meta: { minWidth: 176, grow: 0, align: 'end' },
    cell: (info) => {
      const debt = info.getValue();
      return debt > 0 ? <NumberText value={debt} format="money" tone="negative" /> : <Dash />;
    },
  }),
  column.accessor('responsibleId', {
    header: 'Ответственный',
    meta: { minWidth: 168, grow: 1 },
    cell: (info) => textOrDash(labelOf('responsible', info.getValue())),
  }),
]);

const COLUMN_METAS: readonly CitizenColumnMeta[] = columns.map(
  (def) => def.meta ?? { minWidth: 0, grow: 1 }
);

const GRID_STYLE: GridStyle = {
  '--citizen-table-columns': COLUMN_METAS.map(({ minWidth, grow }) =>
    grow > 0 ? `minmax(${minWidth}px, ${grow}fr)` : `${minWidth}px`
  ).join(' '),
  '--citizen-table-min-width': `${COLUMN_METAS.reduce((sum, meta) => sum + meta.minWidth, 0)}px`,
};

const SORT_FIELDS: ReadonlySet<string> = new Set<SortField>([
  'cardNumber',
  'fullName',
  'birthDate',
  'age',
  'mobilePhone',
  'districtId',
  'status',
  'debt',
  'responsibleId',
  'updatedAt',
]);

function isSortField(id: string): id is SortField {
  return SORT_FIELDS.has(id);
}

type AriaSort = 'ascending' | 'descending' | 'none';

const SORT_ICON: Record<AriaSort, IconName> = {
  ascending: 'arrowUp',
  descending: 'arrowDown',
  none: 'chevronsUpDown',
};

function alignClass(align: CellAlign | undefined): string | undefined {
  return align === 'end' ? styles.end : undefined;
}

function nextIndex(key: string, current: number, count: number): number | null {
  switch (key) {
    case 'ArrowDown':
      return Math.min(current + 1, count - 1);
    case 'ArrowUp':
      return current < 0 ? 0 : Math.max(current - 1, 0);
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export function CitizenTable({
  rows,
  loading,
  refreshing = false,
  sort,
  onSortChange,
  selectedId,
  onSelect,
  onOpen,
  className,
}: CitizenTableProps) {
  const gridId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [headHeight, setHeadHeight] = useState(0);

  const sorting = useMemo<SortingState>(
    () => [{ id: sort.field, desc: sort.direction === 'desc' }],
    [sort.field, sort.direction]
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [next] = typeof updater === 'function' ? updater(sorting) : updater;
    if (next !== undefined && isSortField(next.id)) {
      onSortChange({ field: next.id, direction: next.desc ? 'desc' : 'asc' });
    }
  };

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => String(row.id),
    state: { sorting },
    onSortingChange: handleSortingChange,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: false,
  });

  const tableRows = table.getRowModel().rows;
  const headers = table.getHeaderGroups()[0]?.headers ?? [];

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    getItemKey: (index) => tableRows[index]?.id ?? index,
    overscan: OVERSCAN,
    scrollMargin: headHeight,
    scrollPaddingStart: headHeight,
  });

  useLayoutEffect(() => {
    const head = headRef.current;
    if (head === null) return;
    const observer = new ResizeObserver(() => setHeadHeight(head.offsetHeight));
    observer.observe(head);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [rows]);

  const selectedIndex = useMemo(
    () => (selectedId === null ? -1 : rows.findIndex((row) => row.id === selectedId)),
    [rows, selectedId]
  );

  const rowDomId = (id: CitizenId) => `${gridId}-row-${id}`;
  const virtualItems = virtualizer.getVirtualItems();
  const selectedRendered = virtualItems.some((item) => item.index === selectedIndex);
  const showSkeleton = loading && rows.length === 0;
  const showEmpty = !loading && rows.length === 0;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || rows.length === 0) return;

    if (event.key === 'Enter') {
      const row = rows[selectedIndex];
      if (row === undefined) return;
      event.preventDefault();
      onOpen(row.id);
      return;
    }

    const index = nextIndex(event.key, selectedIndex, rows.length);
    const row = index === null ? undefined : rows[index];
    if (index === null || row === undefined) return;
    event.preventDefault();
    onSelect(row.id);
    virtualizer.scrollToIndex(index);
  }

  return (
    <div
      ref={scrollRef}
      role="grid"
      aria-label="Список граждан"
      aria-rowcount={rows.length + 1}
      aria-colcount={headers.length}
      aria-busy={loading || refreshing}
      aria-activedescendant={
        selectedRendered && selectedId !== null ? rowDomId(selectedId) : undefined
      }
      tabIndex={0}
      className={cn(styles.root, className)}
      style={GRID_STYLE}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.content}>
        <div ref={headRef} role="rowgroup" className={styles.head}>
          <div role="row" aria-rowindex={1} className={styles.row}>
            {headers.map((header) => {
              const { meta } = header.column.columnDef;
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();
              const ariaSort: AriaSort =
                sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none';

              return (
                <div
                  key={header.id}
                  role="columnheader"
                  aria-sort={canSort ? ariaSort : undefined}
                  className={cn(styles.th, alignClass(meta?.align))}
                >
                  {canSort ? (
                    <button
                      type="button"
                      className={cn(styles.sortButton, sorted && styles.sortButtonActive)}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className={styles.headerLabel}>
                        <table.FlexRender header={header} />
                      </span>
                      <Icon name={SORT_ICON[ariaSort]} size="sm" className={styles.sortIcon} />
                    </button>
                  ) : (
                    <span className={styles.headerLabel}>
                      <table.FlexRender header={header} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {showSkeleton && (
          <div role="rowgroup" aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }, (_, rowIndex) => (
              <div key={rowIndex} className={cn(styles.row, styles.bodyRow)}>
                {SKELETON_WIDTHS.slice(0, headers.length).map((width, cellIndex) => (
                  <div key={cellIndex} className={styles.td}>
                    <Skeleton width={width} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {showEmpty && (
          <div role="rowgroup">
            <div role="row" aria-rowindex={2} className={styles.row}>
              <div role="gridcell" className={cn(styles.td, styles.empty)}>
                Граждане не найдены
              </div>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div
            role="rowgroup"
            className={cn(styles.body, refreshing && styles.refreshing)}
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualItems.map((item) => {
              const row = tableRows[item.index];
              if (row === undefined) return null;
              const { id } = row.original;
              const selected = id === selectedId;

              return (
                <div
                  key={item.key}
                  ref={virtualizer.measureElement}
                  id={rowDomId(id)}
                  role="row"
                  aria-rowindex={item.index + 2}
                  aria-selected={selected}
                  data-index={item.index}
                  className={cn(
                    styles.row,
                    styles.bodyRow,
                    styles.virtualRow,
                    selected && styles.selected
                  )}
                  style={{
                    transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                  }}
                  onClick={() => onSelect(id)}
                  onDoubleClick={() => onOpen(id)}
                >
                  {row.getAllCells().map((cell) => (
                    <div
                      key={cell.id}
                      role="gridcell"
                      className={cn(styles.td, alignClass(cell.column.columnDef.meta?.align))}
                    >
                      <table.FlexRender cell={cell} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
