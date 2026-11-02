import { createContext, use } from 'react';
import { useStore } from 'zustand';

import type { DashboardState, DashboardStore } from 'stores/LocalStore/DashboardStore';

export const DashboardStoreContext = createContext<DashboardStore | null>(null);

export function useDashboardStore(): DashboardStore {
  const store = use(DashboardStoreContext);
  if (store === null)
    throw new Error('useDashboardStore: нет DashboardStoreContext выше по дереву');
  return store;
}

export function useDashboard<T>(selector: (state: DashboardState) => T): T {
  return useStore(useDashboardStore().state, selector);
}
