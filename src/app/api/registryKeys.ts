import type { CitizenId } from 'types/common';
import type { DashboardQuery } from 'types/dashboard';
import type { CitizenQuery } from 'types/registry';

export const registryKeys = {
  all: ['registry'] as const,
  list: (query: CitizenQuery) => [...registryKeys.all, 'list', query] as const,
  preview: (id: CitizenId) => [...registryKeys.all, 'preview', id] as const,
  card: (id: CitizenId) => [...registryKeys.all, 'card', id] as const,
  dashboard: (query: DashboardQuery) => [...registryKeys.all, 'dashboard', query] as const,
};
