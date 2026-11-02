import { createStore } from 'zustand/vanilla';

import { buildSearch, parseSearch } from 'utils/registry';
import type { QueryParams, QueryParamsPatch } from 'utils/registry';

import type { DataRouter, Location } from 'react-router';

export type { QueryParams, QueryParamsPatch, QueryParamValue } from 'utils/registry';

export interface QueryParamsState {
  pathname: string;
  search: string;
  params: QueryParams;
}

export interface SetParamsOptions {
  push?: boolean;
}

export class QueryParamsStore {
  readonly state = createStore<QueryParamsState>()(() => ({
    pathname: '/',
    search: '',
    params: {},
  }));

  private router: DataRouter | null = null;

  attach(router: DataRouter): () => void {
    this.router = router;
    this.sync(router.state.location);
    const unsubscribe = router.subscribe((state) => this.sync(state.location));
    return () => {
      unsubscribe();
      this.router = null;
    };
  }

  setParams(patch: QueryParamsPatch, options: SetParamsOptions = {}): void {
    const router = this.router;
    if (router === null) {
      throw new Error('QueryParamsStore: роутер не подключён, вызови attach(router) в main.tsx.');
    }

    const { pathname, search, hash } = router.state.location;
    const current = parseSearch(search);
    const nextSearch = buildSearch({ ...current, ...patch });
    if (nextSearch === buildSearch(current)) return;

    void router.navigate(
      { pathname, search: nextSearch, hash },
      { replace: options.push !== true }
    );
  }

  private sync({ pathname, search }: Location): void {
    const current = this.state.getState();
    if (current.pathname === pathname && current.search === search) return;
    this.state.setState({ pathname, search, params: parseSearch(search) });
  }
}
