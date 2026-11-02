import type { DashboardData, DashboardFilters } from 'types/dashboard';

export type DashboardLoad =
  | { status: 'loading'; data: DashboardData | null }
  | { status: 'ready'; data: DashboardData }
  | { status: 'error'; data: DashboardData | null; message: string };

export interface DashboardState {
  filters: DashboardFilters;
  load: DashboardLoad;
}
