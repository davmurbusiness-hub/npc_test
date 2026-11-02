import type { IsoDate } from 'types/common';
import type {
  CitizenFilters,
  CitizenIndex,
  CitizenPage,
  CitizenQuery,
  CitizenRow,
  SortState,
} from 'types/registry';
import { DEFAULT_SORT } from 'utils/registry';

import { compileFilters } from './filters';
import { compileSearch } from './search';
import { SortOrders, isSortField } from './sort';

const MAX_PAGE_SIZE = 200;

const CACHED_RESULTS = 4;

function sortOf({ field, direction }: SortState): SortState {
  if (!isSortField(field)) return DEFAULT_SORT;
  return { field, direction: direction === 'asc' ? 'asc' : 'desc' };
}

export class CitizenListing {
  private readonly rows: CitizenIndex;
  private readonly nameKeys: readonly string[];
  private readonly todayIso: IsoDate;
  private readonly orders: SortOrders;
  private readonly results = new Map<string, Int32Array>();

  constructor(rows: CitizenIndex, nameKeys: readonly string[], todayIso: IsoDate) {
    this.rows = rows;
    this.nameKeys = nameKeys;
    this.todayIso = todayIso;
    this.orders = new SortOrders(rows);
  }

  list(query: CitizenQuery): CitizenPage {
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(query.pageSize)));
    const page = Math.max(0, Math.trunc(query.page));
    const found = this.select(query.search, query.filters, sortOf(query.sort));

    const rows: CitizenRow[] = [];
    for (const index of found.subarray(page * pageSize, (page + 1) * pageSize)) {
      const row = this.rows[index];
      if (row !== undefined) rows.push(row);
    }
    return { rows, found: found.length, total: this.rows.length, page, pageSize };
  }

  private select(search: string, filters: CitizenFilters, sort: SortState): Int32Array {
    const key = JSON.stringify([
      search.trim(),
      Object.entries(filters).sort(([a], [b]) => a.localeCompare(b)),
      sort.field,
      sort.direction,
    ]);
    const cached = this.results.get(key);
    if (cached !== undefined) {
      this.results.delete(key);
      this.results.set(key, cached);
      return cached;
    }

    const order = this.orders.get(sort);
    const matchSearch = compileSearch(search, this.nameKeys);
    const matchFilters = compileFilters(filters, this.todayIso);
    let result = order;
    if (matchSearch !== null || matchFilters !== null) {
      const picked = new Int32Array(order.length);
      let count = 0;
      for (const index of order) {
        const row = this.rows[index];
        if (row === undefined) continue;
        if (matchFilters !== null && !matchFilters(row)) continue;
        if (matchSearch !== null && !matchSearch(row, index)) continue;
        picked[count++] = index;
      }
      result = picked.slice(0, count);
    }

    this.results.set(key, result);
    if (this.results.size > CACHED_RESULTS) {
      const oldest = this.results.keys().next().value;
      if (oldest !== undefined) this.results.delete(oldest);
    }
    return result;
  }
}
