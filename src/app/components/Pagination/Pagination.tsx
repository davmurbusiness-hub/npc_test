import cn from 'classnames';

import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { formatNumber } from 'utils/format';

import styles from './Pagination.module.scss';

export interface PaginationProps {
  page: number;

  pageSize: number;

  total: number;

  onChange: (page: number) => void;

  className?: string;
}

type PageItem = number | 'gapStart' | 'gapEnd';

const VISIBLE_ITEMS = 7;

function count(value: number): string {
  return formatNumber(value, 'count') ?? String(value);
}

function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= VISIBLE_ITEMS) return Array.from({ length: pageCount }, (_, index) => index);

  const last = pageCount - 1;
  const edge = VISIBLE_ITEMS - 2;
  if (page < edge - 1) {
    return [...Array.from({ length: edge }, (_, index) => index), 'gapEnd', last];
  }
  if (page > last - edge + 1) {
    return [0, 'gapStart', ...Array.from({ length: edge }, (_, index) => last - edge + 1 + index)];
  }
  return [0, 'gapStart', page - 1, page, page + 1, 'gapEnd', last];
}

export function Pagination({ page, pageSize, total, onChange, className }: PaginationProps) {
  if (total <= 0 || pageSize <= 0) return null;

  const pageCount = Math.ceil(total / pageSize);
  const current = Math.min(Math.max(page, 0), pageCount - 1);
  const from = current * pageSize + 1;
  const to = Math.min((current + 1) * pageSize, total);

  return (
    <nav aria-label="Страницы" className={cn(styles.root, className)}>
      <Text as="p" size="sm" color="secondary" className={styles.range}>
        {count(from)}–{count(to)} из {count(total)}
      </Text>
      {pageCount > 1 && (
        <div className={styles.controls}>
          <IconButton
            icon="chevronLeft"
            label="Предыдущая страница"
            size="sm"
            disabled={current === 0}
            onClick={() => {
              onChange(current - 1);
            }}
          />
          <ul className={styles.pages}>
            {pageItems(current, pageCount).map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <button
                    type="button"
                    aria-current={item === current ? 'page' : undefined}
                    aria-label={`Страница ${count(item + 1)}`}
                    onClick={() => {
                      if (item !== current) onChange(item);
                    }}
                    className={styles.page}
                  >
                    {count(item + 1)}
                  </button>
                </li>
              ) : (
                <li key={item} className={styles.gap} aria-hidden="true">
                  …
                </li>
              )
            )}
          </ul>
          <IconButton
            icon="chevronRight"
            label="Следующая страница"
            size="sm"
            disabled={current === pageCount - 1}
            onClick={() => {
              onChange(current + 1);
            }}
          />
        </div>
      )}
    </nav>
  );
}
