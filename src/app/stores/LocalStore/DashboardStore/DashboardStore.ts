import { createStore } from 'zustand/vanilla';

import type { RegistryClient } from 'api';
import type { RootStore } from 'stores/RootStore';
import type { DictValue, IsoDate } from 'types/common';
import type { DashboardFilters } from 'types/dashboard';
import type { PeriodMonths } from 'types/dictionaries';
import type { LocalStore } from 'types/store';
import {
  EMPTY_DASHBOARD_FILTERS,
  parseDashboardParams,
  toDashboardParams,
  toDashboardQuery,
} from 'utils/dashboard';
import { messageOf } from 'utils/format';
import type { QueryParams } from 'utils/registry';

import type { DashboardState } from './types';

export interface DashboardStoreDeps {
  rootStore: RootStore;
  api: RegistryClient;
}

export interface FilterOption {
  value: DictValue;
  label: string;
}

export class DashboardStore implements LocalStore {
  readonly state = createStore<DashboardState>()(() => ({
    filters: EMPTY_DASHBOARD_FILTERS,
    load: { status: 'loading', data: null },
  }));

  readonly today: IsoDate;
  readonly districtOptions: readonly FilterOption[];
  readonly responsibleOptions: readonly FilterOption[];

  private readonly rootStore: RootStore;
  private readonly api: RegistryClient;

  private unsubscribes: (() => void)[] = [];
  private pathname: string | null = null;
  private queryKey: string | null = null;

  constructor({ rootStore, api }: DashboardStoreDeps) {
    this.rootStore = rootStore;
    this.api = api;
    this.today = api.today;
    this.districtOptions = api.dictionaries.district;
    this.responsibleOptions = api.dictionaries.responsible;
  }

  init(): void {
    if (this.unsubscribes.length > 0) return;
    const location = this.rootStore.queryParams.state;
    this.pathname = location.getState().pathname;
    this.unsubscribes = [
      location.subscribe(({ pathname, params }) => {
        if (pathname === this.pathname) this.apply(params);
      }),
    ];
    this.apply(location.getState().params);
  }

  destroy(): void {
    for (const unsubscribe of this.unsubscribes) unsubscribe();
    this.unsubscribes = [];
    this.queryKey = null;
  }

  setDistrict(districtId: DictValue | null): void {
    this.write({ districtId });
  }

  setResponsible(responsibleId: DictValue | null): void {
    this.write({ responsibleId });
  }

  setPeriod(periodMonths: PeriodMonths): void {
    this.write({ periodMonths });
  }

  retry(): void {
    this.queryKey = null;
    this.load(this.state.getState().filters);
  }

  private write(patch: Partial<DashboardFilters>): void {
    const { filters } = this.state.getState();
    this.rootStore.queryParams.setParams(toDashboardParams({ ...filters, ...patch }));
  }

  private apply(raw: QueryParams): void {
    const filters = parseDashboardParams(raw, this.api.dictionaries);
    this.state.setState({ filters });
    this.load(filters);
  }

  private load(filters: DashboardFilters): void {
    const query = toDashboardQuery(filters);
    const key = JSON.stringify(query);
    if (key === this.queryKey) return;
    this.queryKey = key;
    this.state.setState(({ load }) => ({ load: { status: 'loading', data: load.data } }));

    this.api.getDashboard(query).then(
      (data) => {
        if (this.queryKey !== key) return;
        this.state.setState({ load: { status: 'ready', data } });
      },
      (error: unknown) => {
        if (this.queryKey !== key) return;
        this.state.setState(({ load }) => ({
          load: { status: 'error', data: load.data, message: messageOf(error) },
        }));
      }
    );
  }
}
