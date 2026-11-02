import cn from 'classnames';

import { Button } from 'components/Button';
import { EmptyState } from 'components/EmptyState';
import { PageHeader } from 'components/PageHeader';
import { Pagination } from 'components/Pagination';
import { StatusAnnouncer } from 'components/StatusAnnouncer';
import type { CitizenId } from 'types/common';
import type { CitizenFilters, CitizenPage, SortState } from 'types/registry';
import { formatNumber } from 'utils/format';
import { countActiveFilters } from 'utils/registry';

import { ActiveFilterChips } from '../ActiveFilterChips';
import { CitizenPreview } from '../CitizenPreview';
import { CitizenTable } from '../CitizenTable';
import { FilterPanel } from '../FilterPanel';
import { SearchField } from '../SearchField';
import styles from './RegistryView.module.scss';

import type { CitizenPreviewState } from '../CitizenPreview';

export type RegistryListState =
  | { status: 'loading'; page: CitizenPage | null }
  | { status: 'ready'; page: CitizenPage }
  | { status: 'error'; page: CitizenPage | null; message: string };

export interface RegistryViewProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: CitizenFilters;
  onFiltersChange: (filters: CitizenFilters) => void;
  onFiltersReset: () => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  list: RegistryListState;
  onPageChange: (page: number) => void;
  onListRetry: () => void;
  selectedId: CitizenId | null;
  onSelect: (id: CitizenId) => void;
  onOpen: (id: CitizenId) => void;
  preview: CitizenPreviewState;
  cardHref: string | null;
  onPreviewClose: () => void;
  onPreviewRetry: () => void;
  className?: string;
}

function summaryOf(page: CitizenPage | null): string | null {
  if (page === null) return null;
  return `Найдено ${formatNumber(page.found, 'count')} из ${formatNumber(page.total, 'count')} граждан`;
}

export function RegistryView({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onFiltersReset,
  sort,
  onSortChange,
  list,
  onPageChange,
  onListRetry,
  selectedId,
  onSelect,
  onOpen,
  preview,
  cardHref,
  onPreviewClose,
  onPreviewRetry,
  className,
}: RegistryViewProps) {
  const activeCount = countActiveFilters(filters);
  const narrowed = activeCount > 0 || search !== '';
  const page = list.page;
  const summary = summaryOf(page);

  function renderList() {
    if (list.status === 'error' && page === null) {
      return (
        <EmptyState
          title="Не удалось загрузить список"
          description={list.message}
          action={<Button onClick={onListRetry}>Повторить</Button>}
        />
      );
    }

    if (list.status === 'ready' && page?.found === 0) {
      return (
        <EmptyState
          title="Никого не нашли"
          description={
            narrowed
              ? 'Попробуйте смягчить условия поиска или сбросить фильтры.'
              : 'В картотеке пока нет граждан.'
          }
          action={narrowed ? <Button onClick={onFiltersReset}>Сбросить фильтры</Button> : undefined}
        />
      );
    }

    return (
      <CitizenTable
        className={styles.table}
        rows={page?.rows ?? []}
        loading={page === null}
        refreshing={list.status === 'loading' && page !== null}
        sort={sort}
        onSortChange={onSortChange}
        selectedId={selectedId}
        onSelect={onSelect}
        onOpen={onOpen}
      />
    );
  }

  return (
    <div className={cn(styles.root, className)}>
      <PageHeader
        title="Картотека"
        description={summary ?? 'Загружаем картотеку…'}
        className={styles.header}
      />
      <StatusAnnouncer message={summary} />

      <SearchField className={styles.search} value={search} onChange={onSearchChange} />
      <FilterPanel filters={filters} onChange={onFiltersChange} />

      <ActiveFilterChips filters={filters} onChange={onFiltersChange} onReset={onFiltersReset} />

      {list.status === 'error' && page !== null && (
        <div className={styles.inlineError} role="alert">
          <span>Не удалось обновить список: {list.message}</span>
          <Button size="sm" variant="ghost" onClick={onListRetry}>
            Повторить
          </Button>
        </div>
      )}

      <div className={cn(styles.workspace, preview.status !== 'idle' && styles.hasSelection)}>
        <section className={styles.list} aria-label="Список граждан">
          <div className={styles.listBody}>{renderList()}</div>
          {page !== null && (
            <Pagination
              className={styles.pagination}
              page={page.page}
              pageSize={page.pageSize}
              total={page.found}
              onChange={onPageChange}
            />
          )}
        </section>

        <CitizenPreview
          className={styles.preview}
          state={preview}
          cardHref={cardHref}
          onClose={onPreviewClose}
          onRetry={onPreviewRetry}
        />
      </div>
    </div>
  );
}
