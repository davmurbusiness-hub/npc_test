import { DICTIONARIES } from 'data/dictionaries';
import type { DictValue } from 'types/common';
import type { DistrictsData } from 'types/dashboard';
import type { CitizenRow } from 'types/registry';

import { percentOf } from './counter';

import type { Collector, Counter, DashboardContext } from './counter';

interface Entry {
  citizens: Counter;
  debtors: Counter;
}

export class DistrictsCollector implements Collector<DistrictsData> {
  private readonly entries: ReadonlyMap<DictValue, Entry>;

  constructor(ctx: DashboardContext) {
    this.entries = new Map(
      DICTIONARIES.district.map(({ value }) => [
        value,
        {
          citizens: ctx.counter({ districtIds: [value] }, { district: false }),
          debtors: ctx.counter({ districtIds: [value], hasDebt: true }, { district: false }),
        },
      ])
    );
  }

  add(row: CitizenRow): void {
    if (row.districtId === null) return;
    const entry = this.entries.get(row.districtId);
    if (entry?.citizens.add(row)) entry.debtors.add(row);
  }

  result(): DistrictsData {
    let citizens = 0;
    let debtors = 0;
    const items = [...this.entries].map(([districtId, entry]) => {
      citizens += entry.citizens.count;
      debtors += entry.debtors.count;
      return {
        districtId,
        citizens: entry.citizens.count,
        debtors: entry.debtors.count,
        debtorShare: percentOf(entry.debtors.count, entry.citizens.count) ?? 0,
        debtAmount: entry.debtors.debt,
        link: entry.debtors.link,
      };
    });
    items.sort((a, b) => b.debtorShare - a.debtorShare || a.districtId.localeCompare(b.districtId));
    return { items, averageShare: percentOf(debtors, citizens) };
  }
}
