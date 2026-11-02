import { createContext, use } from 'react';
import { useStore } from 'zustand';

import type { CitizenState, CitizenStore } from 'stores/LocalStore/CitizenStore';

export const CitizenStoreContext = createContext<CitizenStore | null>(null);

export function useCitizenStore(): CitizenStore {
  const store = use(CitizenStoreContext);
  if (store === null) throw new Error('useCitizenStore: нет CitizenStoreContext выше по дереву');
  return store;
}

export function useCitizen<T>(selector: (state: CitizenState) => T): T {
  return useStore(useCitizenStore().state, selector);
}
