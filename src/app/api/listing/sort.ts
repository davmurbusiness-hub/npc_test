import { DICTIONARIES } from 'data/dictionaries';
import type { DictionaryKey, SortDirection } from 'types/dictionaries';
import type { CitizenIndex, CitizenRow, SortField, SortState } from 'types/registry';

import { normalizeName } from './search';

type FieldSort =
  | { kind: 'number'; key: (row: CitizenRow) => number | null }
  | { kind: 'code'; key: (row: CitizenRow) => string | null };

const collator = new Intl.Collator('ru', { sensitivity: 'base' });

function alphabeticalRank(key: DictionaryKey): ReadonlyMap<string, number> {
  const sorted = [...DICTIONARIES[key]].sort((a, b) => collator.compare(a.label, b.label));
  return new Map(sorted.map((item, index) => [item.value, index]));
}

const DISTRICT_RANK = alphabeticalRank('district');
const RESPONSIBLE_RANK = alphabeticalRank('responsible');
const STATUS_ORDER = new Map(DICTIONARIES.cardStatus.map((item, index) => [item.value, index]));

const FIELDS: Readonly<Record<SortField, FieldSort>> = {
  cardNumber: { kind: 'code', key: (row) => row.cardNumber },
  fullName: { kind: 'code', key: (row) => normalizeName(row.fullName) },
  birthDate: { kind: 'code', key: (row) => row.birthDate },
  age: { kind: 'number', key: (row) => row.age },
  mobilePhone: { kind: 'code', key: (row) => row.mobilePhone },
  districtId: {
    kind: 'number',
    key: (row) => (row.districtId === null ? null : (DISTRICT_RANK.get(row.districtId) ?? null)),
  },
  status: { kind: 'number', key: (row) => STATUS_ORDER.get(row.status) ?? null },
  responsibleId: { kind: 'number', key: (row) => RESPONSIBLE_RANK.get(row.responsibleId) ?? null },
  updatedAt: { kind: 'code', key: (row) => row.updatedAt },
};

export function isSortField(value: string): value is SortField {
  return Object.hasOwn(FIELDS, value);
}

type Compare = (a: string | number, b: string | number) => number;

function comparatorOf(kind: FieldSort['kind']): Compare {
  switch (kind) {
    case 'number':
      return (a, b) => Number(a) - Number(b);
    case 'code':
      return (a, b) => {
        const left = String(a);
        const right = String(b);
        return left < right ? -1 : left > right ? 1 : 0;
      };
  }
}

export class SortOrders {
  private readonly rows: CitizenIndex;
  private readonly cache = new Map<string, Int32Array>();

  constructor(rows: CitizenIndex) {
    this.rows = rows;
  }

  get({ field, direction }: SortState): Int32Array {
    const key = `${field}.${direction}`;
    let order = this.cache.get(key);
    if (order === undefined) {
      order = this.build(field, direction);
      this.cache.set(key, order);
    }
    return order;
  }

  private build(field: SortField, direction: SortDirection): Int32Array {
    const { kind, key } = FIELDS[field];
    const compare = comparatorOf(kind);
    const sign = direction === 'asc' ? 1 : -1;

    const filled: { index: number; value: string | number }[] = [];
    const empty: number[] = [];
    this.rows.forEach((row, index) => {
      const value = key(row);
      if (value === null) empty.push(index);
      else filled.push({ index, value });
    });
    filled.sort((a, b) => sign * compare(a.value, b.value) || a.index - b.index);

    const order = new Int32Array(this.rows.length);
    filled.forEach((item, position) => (order[position] = item.index));
    empty.forEach((index, position) => (order[filled.length + position] = index));
    return order;
  }
}
