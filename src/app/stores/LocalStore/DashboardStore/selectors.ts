import type { DashboardState } from './types';

export const selectRefreshing = (state: DashboardState): boolean =>
  state.load.status === 'loading' && state.load.data !== null;
