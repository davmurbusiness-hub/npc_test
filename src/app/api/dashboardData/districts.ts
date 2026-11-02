import { DICTIONARIES } from 'data/dictionaries';
import type { DictValue } from 'types/common';
import type { DistrictsData } from 'types/dashboard';
import type { CitizenRow } from 'types/registry';

import type { Collector, Counter, DashboardContext } from './counter';

export class DistrictsCollector implements Collector<DistrictsData> {
  private readonly entries: ReadonlyMap<DictValue, Counter>;

  constructor(ctx: DashboardContext) {
    this.entries = new Map(
      DICTIONARIES.district.map(({ value }) => [
        value,
        ctx.counter({ districtIds: [value] }, { district: false }),
      ])
    );
  }

  add(row: CitizenRow): void {
    if (row.districtId === null) return;
    this.entries.get(row.districtId)?.add(row);
  }

  result(): DistrictsData {
    let total = 0;
    const items = [...this.entries].map(([districtId, counter]) => {
      total += counter.count;
      return { districtId, citizens: counter.count, link: counter.link };
    });
    items.sort((a, b) => b.citizens - a.citizens || a.districtId.localeCompare(b.districtId));
    return { items, average: items.length === 0 ? null : total / items.length };
  }
}
