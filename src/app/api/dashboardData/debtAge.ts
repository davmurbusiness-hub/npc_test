import type { DebtAgeStat } from 'types/dashboard';
import type { DebtAgeBucket } from 'types/dictionaries';
import type { CitizenRow } from 'types/registry';
import { DEBT_AGE_BUCKETS } from 'utils/registry';

import { debtAgeBucket } from '../listing/filters';

import type { Collector, Counter, DashboardContext } from './counter';

export class DebtAgeCollector implements Collector<DebtAgeStat[]> {
  private readonly buckets: ReadonlyMap<DebtAgeBucket, Counter>;

  constructor(ctx: DashboardContext) {
    this.buckets = new Map(
      DEBT_AGE_BUCKETS.map((bucket) => [bucket, ctx.counter({ debtAge: [bucket] })])
    );
  }

  add(row: CitizenRow): void {
    if (row.debtAgeMonths === null) return;
    this.buckets.get(debtAgeBucket(row.debtAgeMonths))?.add(row);
  }

  result(): DebtAgeStat[] {
    return [...this.buckets].map(([bucket, counter]) => ({
      bucket,
      citizens: counter.count,
      amount: counter.debt,
      link: counter.link,
    }));
  }
}
