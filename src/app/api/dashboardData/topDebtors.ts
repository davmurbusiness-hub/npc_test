import type { TopDebtor } from 'types/dashboard';
import type { CitizenRow } from 'types/registry';

import type { Collector, Counter, DashboardContext } from './counter';

const TOP_SIZE = 10;

const ranksAbove = (a: CitizenRow, b: CitizenRow): boolean =>
  a.debt > b.debt || (a.debt === b.debt && a.id < b.id);

export class TopDebtorsCollector implements Collector<TopDebtor[]> {
  private readonly debtors: Counter;
  private readonly top: CitizenRow[] = [];

  constructor(ctx: DashboardContext) {
    this.debtors = ctx.counter({ hasDebt: true });
  }

  add(row: CitizenRow): void {
    if (!this.debtors.matches(row)) return;
    const last = this.top.at(-1);
    if (this.top.length === TOP_SIZE && last !== undefined && !ranksAbove(row, last)) return;
    let index = this.top.length;
    while (index > 0) {
      const above = this.top[index - 1];
      if (above === undefined || !ranksAbove(row, above)) break;
      index -= 1;
    }
    this.top.splice(index, 0, row);
    if (this.top.length > TOP_SIZE) this.top.pop();
  }

  result(): TopDebtor[] {
    return this.top.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      districtId: row.districtId,
      debt: row.debt,
      overdueMonths: row.debtAgeMonths ?? 0,
      lastContactAt: row.lastContactAt,
      responsibleId: row.responsibleId,
    }));
  }
}
