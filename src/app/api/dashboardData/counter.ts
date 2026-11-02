import type { IsoDate } from 'types/common';
import type { DashboardQuery } from 'types/dashboard';
import type { CardStatus } from 'types/dictionaries';
import type { CitizenFilters, CitizenRow, Drilldown, FilterValue } from 'types/registry';

import { compileFilters } from '../listing/filters';

import type { RowPredicate } from '../listing/filters';

const COUNTED_STATUSES: readonly CardStatus[] = ['active', 'review'];

export interface ScopeOptions {
  district?: boolean;
  responsible?: boolean;
}

export interface Collector<T> {
  add(row: CitizenRow): void;
  result(): T;
}

export class Counter {
  readonly link: Drilldown;
  readonly matches: RowPredicate;
  count = 0;

  constructor(filters: CitizenFilters, todayIso: IsoDate) {
    this.link = { filters };
    this.matches = compileFilters(filters, todayIso) ?? (() => true);
  }

  add(row: CitizenRow): boolean {
    if (!this.matches(row)) return false;
    this.count += 1;
    return true;
  }
}

export class DashboardContext {
  readonly query: DashboardQuery;
  readonly todayIso: IsoDate;

  constructor(query: DashboardQuery, todayIso: IsoDate) {
    this.query = query;
    this.todayIso = todayIso;
  }

  counter(filters: CitizenFilters, options: ScopeOptions = {}): Counter {
    return new Counter({ ...this.scope(options), ...filters }, this.todayIso);
  }

  private scope({ district = true, responsible = true }: ScopeOptions): CitizenFilters {
    const { districtId, responsibleId } = this.query;
    const filters: Record<string, FilterValue> = { status: [...COUNTED_STATUSES] };
    if (district && districtId !== null) filters.districtIds = [districtId];
    if (responsible && responsibleId !== null) filters.responsibleIds = [responsibleId];
    return filters;
  }
}
