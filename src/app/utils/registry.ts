import type { CitizenId, DictValue } from 'types/common';
import type { DebtAgeBucket, Dictionaries, DictionaryKey, ExpiryKind } from 'types/dictionaries';
import type {
  CitizenFilters,
  FilterValue,
  NumberRange,
  Drilldown,
  SortField,
  SortState,
} from 'types/registry';

export type RangeFilterKey = 'age';
export type FilterKey = RegistryFilterKey;

export const EMPTY_RANGE: NumberRange = { min: null, max: null };

export function listFilter(filters: CitizenFilters, key: ListFilterKey): readonly string[] {
  const value = filters[key];
  return Array.isArray(value) ? value : [];
}

export function switchFilter(filters: CitizenFilters, key: SwitchFilterKey): boolean {
  return filters[key] === true;
}

export function daysFilter(filters: CitizenFilters, key: DaysFilterKey): number | null {
  const value = filters[key];
  return typeof value === 'number' ? value : null;
}

export function rangeFilter(filters: CitizenFilters, key: RangeFilterKey): NumberRange {
  const value = filters[key];
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : EMPTY_RANGE;
}

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null || value === false) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return value.min === null && value.max === null;
  return false;
}

export function withFilter(
  filters: CitizenFilters,
  key: FilterKey,
  value: FilterValue
): CitizenFilters {
  const rest = Object.fromEntries(Object.entries(filters).filter(([name]) => name !== key));
  return isEmptyFilterValue(value) ? rest : { ...rest, [key]: value };
}

export function countActiveFilters(filters: CitizenFilters): number {
  return Object.values(filters).filter((value) => !isEmptyFilterValue(value)).length;
}

export interface RegistryParams {
  search: string;
  filters: CitizenFilters;
  sort: SortState;
  page: number;
  selectedId: CitizenId | null;
}

export const DEFAULT_SORT: SortState = { field: 'updatedAt', direction: 'desc' };

export const EMPTY_REGISTRY_PARAMS: RegistryParams = {
  search: '',
  filters: {},
  sort: DEFAULT_SORT,
  page: 0,
  selectedId: null,
};

export const DEBT_AGE_BUCKETS: readonly DebtAgeBucket[] = [
  'lt1m',
  'm1to3',
  'm3to6',
  'm6to12',
  'gt12',
];
export const EXPIRY_KINDS: readonly ExpiryKind[] = [
  'document',
  'benefit',
  'powerOfAttorney',
  'consent',
];

const LIST_FILTERS = {
  status: 'cardStatus',
  districtIds: 'district',
  gender: 'gender',
  benefitKinds: 'benefitKind',
  benefitVerification: 'benefitVerification',
  objectTypes: 'objectType',
  debtAge: DEBT_AGE_BUCKETS,
  tags: 'citizenTag',
  responsibleIds: 'responsible',
  expiringKinds: EXPIRY_KINDS,
  reviewReasons: 'reviewReason',
  contactChannels: 'contactChannel',
  specialNeeds: 'specialNeed',
} as const satisfies Readonly<Record<string, DictionaryKey | readonly string[]>>;

const SWITCH_FILTERS = [
  'hasAnyBenefit',
  'hasDebt',
  'deliveryFailed',
  'noContact',
  'unreachable',
  'noValidConsent',
] as const;

const DAYS_FILTERS = ['expiringWithinDays', 'noContactDays', 'onReviewDays'] as const;

export type ListFilterKey = keyof typeof LIST_FILTERS;
export type SwitchFilterKey = (typeof SWITCH_FILTERS)[number];
export type DaysFilterKey = (typeof DAYS_FILTERS)[number];
export type RegistryFilterKey = ListFilterKey | SwitchFilterKey | DaysFilterKey | 'age';

const SORT_FIELDS: Readonly<Record<SortField, true>> = {
  cardNumber: true,
  fullName: true,
  birthDate: true,
  age: true,
  mobilePhone: true,
  districtId: true,
  status: true,
  debt: true,
  responsibleId: true,
  updatedAt: true,
};

const isSortField = (value: string): value is SortField => Object.hasOwn(SORT_FIELDS, value);

const MAX_SEARCH_LENGTH = 200;
const MAX_AGE = 150;
const MAX_DAYS = 36_500;
const MAX_PAGE = 999_999;
const MAX_ID = 999_999_999;

const first = (values: readonly string[] | undefined): string | undefined => values?.[0];

function intOf(value: string | undefined, max: number): number | null {
  if (value === undefined || !/^(0|[1-9]\d{0,8})$/.test(value)) return null;
  const number = Number(value);
  return number <= max ? number : null;
}

function listOf(values: readonly string[] | undefined, allowed: readonly DictValue[]): DictValue[] {
  if (values === undefined) return [];
  const picked = new Set(values);
  return allowed.filter((value) => picked.has(value));
}

function sortOf(value: string | undefined): SortState {
  const [field = '', direction, ...rest] = value?.split('.') ?? [];
  if (!isSortField(field) || rest.length > 0) return DEFAULT_SORT;
  if (direction !== 'asc' && direction !== 'desc') return DEFAULT_SORT;
  return { field, direction };
}

export function parseRegistryParams(
  params: QueryParams,
  dictionaries: Dictionaries
): RegistryParams {
  const filters: Record<string, FilterValue> = {};

  for (const [key, source] of Object.entries(LIST_FILTERS)) {
    const allowed =
      typeof source === 'string' ? dictionaries[source].map((item) => item.value) : source;
    const values = listOf(params[key], allowed);
    if (values.length > 0) filters[key] = values;
  }
  for (const key of SWITCH_FILTERS) {
    if (first(params[key]) === '1') filters[key] = true;
  }
  for (const key of DAYS_FILTERS) {
    const days = intOf(first(params[key]), MAX_DAYS);
    if (days !== null) filters[key] = days;
  }
  const age: NumberRange = {
    min: intOf(first(params.ageMin), MAX_AGE),
    max: intOf(first(params.ageMax), MAX_AGE),
  };
  if (age.min !== null || age.max !== null) filters.age = age;

  const page = intOf(first(params.p), MAX_PAGE);
  const id = intOf(first(params.id), MAX_ID);
  return {
    search: (first(params.q) ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
    filters,
    sort: sortOf(first(params.sort)),
    page: page !== null && page > 0 ? page - 1 : 0,
    selectedId: id !== null && id > 0 ? id : null,
  };
}

const isDefaultSort = ({ field, direction }: SortState): boolean =>
  field === DEFAULT_SORT.field && direction === DEFAULT_SORT.direction;

function rangeOf(value: FilterValue | undefined): NumberRange | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null;
}

export function toRegistryParams({
  search,
  filters,
  sort,
  page,
  selectedId,
}: RegistryParams): QueryParamsPatch {
  const patch: Record<string, QueryParamValue> = {
    q: search.trim(),
    sort: isDefaultSort(sort) ? null : `${sort.field}.${sort.direction}`,
    p: page > 0 ? page + 1 : null,
    id: selectedId,
  };

  for (const key of Object.keys(LIST_FILTERS)) {
    const value = filters[key];
    patch[key] = Array.isArray(value) ? value : null;
  }
  for (const key of SWITCH_FILTERS) {
    patch[key] = filters[key] === true ? 1 : null;
  }
  for (const key of DAYS_FILTERS) {
    const value = filters[key];
    patch[key] = typeof value === 'number' ? value : null;
  }
  const age = rangeOf(filters.age);
  patch.ageMin = age?.min ?? null;
  patch.ageMax = age?.max ?? null;

  return patch;
}

export function drilldownSearch({ filters, search = '' }: Drilldown): string {
  return buildSearch(toRegistryParams({ ...EMPTY_REGISTRY_PARAMS, filters, search }));
}

export type QueryParams = Readonly<Record<string, readonly string[]>>;

export type QueryParamValue = string | number | readonly (string | number)[] | null | undefined;

export type QueryParamsPatch = Readonly<Record<string, QueryParamValue>>;

export function parseSearch(search: string): QueryParams {
  const params: Record<string, string[]> = {};
  for (const [key, value] of new URLSearchParams(search)) {
    (params[key] ??= []).push(value);
  }
  return params;
}

function toValues(value: QueryParamValue): string[] {
  if (value === null || value === undefined) return [];
  const list = typeof value === 'object' ? value : [value];
  return list.map(String).filter((item) => item !== '');
}

export function buildSearch(params: QueryParamsPatch): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of toValues(value)) search.append(key, item);
  }
  const text = search.toString();
  return text === '' ? '' : `?${text}`;
}
