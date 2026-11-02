import { createStore } from 'zustand/vanilla';

import type { RegistryClient } from 'api';
import type { RootStore } from 'stores/RootStore';
import type { CitizenId } from 'types/common';
import type { CitizenFilters, CitizenQuery, SortState } from 'types/registry';
import type { LocalStore } from 'types/store';
import { messageOf } from 'utils/format';
import {
  EMPTY_REGISTRY_PARAMS,
  parseRegistryParams,
  toRegistryParams,
  buildSearch,
  parseSearch,
} from 'utils/registry';
import type { RegistryParams, QueryParams } from 'utils/registry';

import type { RegistryState } from './types';

export const PAGE_SIZE = 50;

const SEARCH_DELAY_MS = 300;

export interface RegistryStoreDeps {
  rootStore: RootStore;
  api: RegistryClient;
}

export class RegistryStore implements LocalStore {
  readonly state = createStore<RegistryState>()(() => ({
    searchInput: '',
    params: EMPTY_REGISTRY_PARAMS,
    list: { status: 'loading', page: null },
    preview: { status: 'idle' },
  }));

  private readonly rootStore: RootStore;
  private readonly api: RegistryClient;

  private unsubscribe: (() => void) | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private pathname: string | null = null;
  private listKey: string | null = null;
  private previewId: CitizenId | null = null;

  constructor({ rootStore, api }: RegistryStoreDeps) {
    this.rootStore = rootStore;
    this.api = api;
  }

  init(): void {
    if (this.unsubscribe !== null) return;
    const location = this.rootStore.queryParams.state;
    this.pathname = location.getState().pathname;
    this.unsubscribe = location.subscribe(({ pathname, params }) => {
      if (pathname === this.pathname) this.apply(params);
    });
    this.apply(location.getState().params);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.cancelSearch();
    this.listKey = null;
    this.previewId = null;
  }

  setSearchInput(value: string): void {
    this.state.setState({ searchInput: value });
    this.cancelSearch();
    this.searchTimer = setTimeout(() => {
      this.searchTimer = null;
      if (value.trim() === this.state.getState().params.search) return;
      this.write({ page: 0 });
    }, SEARCH_DELAY_MS);
  }

  setFilters(filters: CitizenFilters): void {
    this.write({ filters, page: 0 });
  }

  resetFilters(): void {
    this.cancelSearch();
    this.state.setState({ searchInput: '' });
    this.write({ search: '', filters: {}, page: 0 });
  }

  setSort(sort: SortState): void {
    this.write({ sort, page: 0 });
  }

  setPage(page: number): void {
    this.write({ page });
  }

  select(id: CitizenId): void {
    this.write({ selectedId: id });
  }

  closePreview(): void {
    this.write({ selectedId: null });
  }

  listSearchFor(id: CitizenId): string {
    const { search } = this.rootStore.queryParams.state.getState();
    return buildSearch({ ...parseSearch(search), id });
  }

  retryList(): void {
    this.listKey = null;
    this.loadList(this.state.getState().params);
  }

  retryPreview(): void {
    this.previewId = null;
    this.loadPreview(this.state.getState().params.selectedId);
  }

  private write(patch: Partial<RegistryParams>): void {
    this.cancelSearch();
    const { params, searchInput } = this.state.getState();
    this.rootStore.queryParams.setParams(
      toRegistryParams({ ...params, search: searchInput, ...patch })
    );
  }

  private apply(raw: QueryParams): void {
    const params = parseRegistryParams(raw, this.api.dictionaries);
    const { searchInput } = this.state.getState();
    const typing = this.searchTimer !== null;
    this.state.setState({
      params,
      searchInput: typing || searchInput.trim() === params.search ? searchInput : params.search,
    });
    this.loadList(params);
    this.loadPreview(params.selectedId);
  }

  private loadList({ search, filters, sort, page }: RegistryParams): void {
    const query: CitizenQuery = { search, filters, sort, page, pageSize: PAGE_SIZE };
    const key = JSON.stringify(query);
    if (key === this.listKey) return;
    this.listKey = key;
    this.state.setState(({ list }) => ({ list: { status: 'loading', page: list.page } }));

    this.api.listCitizens(query).then(
      (result) => {
        if (this.listKey !== key) return;
        const lastPage = Math.max(0, Math.ceil(result.found / PAGE_SIZE) - 1);
        if (page > lastPage) {
          this.write({ page: lastPage });
          return;
        }
        this.state.setState({ list: { status: 'ready', page: result } });
      },
      (error: unknown) => {
        if (this.listKey !== key) return;
        this.state.setState(({ list }) => ({
          list: { status: 'error', page: list.page, message: messageOf(error) },
        }));
      }
    );
  }

  private loadPreview(id: CitizenId | null): void {
    if (id === this.previewId) return;
    this.previewId = id;
    if (id === null) {
      this.state.setState({ preview: { status: 'idle' } });
      return;
    }
    this.state.setState({ preview: { status: 'loading', id } });

    this.api.getPreview(id).then(
      (preview) => {
        if (this.previewId !== id) return;
        this.state.setState({ preview: { status: 'ready', id, preview } });
      },
      (error: unknown) => {
        if (this.previewId !== id) return;
        this.state.setState({ preview: { status: 'error', id, message: messageOf(error) } });
      }
    );
  }

  private cancelSearch(): void {
    if (this.searchTimer === null) return;
    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  }
}
