import type { CollectionMonth } from 'types/dashboard';

import type { DashboardState } from './types';

const EMPTY_MONTHS: readonly CollectionMonth[] = [];

let lastMonths: readonly CollectionMonth[] | null = null;
let lastPeriod = 0;
let lastSlice: readonly CollectionMonth[] = EMPTY_MONTHS;

export function selectCollection(state: DashboardState): readonly CollectionMonth[] {
  const months = state.load.data?.collection ?? EMPTY_MONTHS;
  const period = state.filters.periodMonths;
  if (months !== lastMonths || period !== lastPeriod) {
    lastMonths = months;
    lastPeriod = period;
    lastSlice = months.slice(-period);
  }
  return lastSlice;
}

export const selectRefreshing = (state: DashboardState): boolean =>
  state.load.status === 'loading' && state.load.data !== null;
