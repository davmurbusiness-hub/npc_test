import { QueryParamsStore } from './QueryParamsStore';
import { ThemeStore } from './ThemeStore';

export class RootStore {
  readonly queryParams = new QueryParamsStore();
  readonly theme = new ThemeStore();
}

export const rootStore = new RootStore();
