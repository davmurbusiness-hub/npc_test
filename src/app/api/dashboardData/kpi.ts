import type { CollectionMonth, DashboardKpi, KpiCollection } from 'types/dashboard';
import type { CitizenRow } from 'types/registry';
import { EXPIRING_WITHIN_DAYS, NO_CONTACT_DAYS, REVIEW_OVERDUE_DAYS } from 'utils/dashboard';
import { round2 } from 'utils/format';

import type { Collector, Counter, DashboardContext } from './counter';

export class KpiCollector implements Collector<Omit<DashboardKpi, 'collection'>> {
  private readonly debtors: Counter;
  private readonly onReview: Counter;
  private readonly onReviewOverdue: Counter;
  private readonly expiring: Counter;
  private readonly debtorsNoContact: Counter;
  private readonly unreachable: Counter;

  constructor(ctx: DashboardContext) {
    this.debtors = ctx.counter({ hasDebt: true });
    this.onReview = ctx.counter({ status: ['review'] });
    this.onReviewOverdue = ctx.counter({ status: ['review'], onReviewDays: REVIEW_OVERDUE_DAYS });
    this.expiring = ctx.counter({ expiringWithinDays: EXPIRING_WITHIN_DAYS });
    this.debtorsNoContact = ctx.counter({ hasDebt: true, noContactDays: NO_CONTACT_DAYS });
    this.unreachable = ctx.counter({ unreachable: true });
  }

  add(row: CitizenRow): void {
    this.debtors.add(row);
    if (this.onReview.add(row)) this.onReviewOverdue.add(row);
    this.expiring.add(row);
    this.debtorsNoContact.add(row);
    this.unreachable.add(row);
  }

  result(): Omit<DashboardKpi, 'collection'> {
    const { debtors, onReview, onReviewOverdue, expiring, debtorsNoContact, unreachable } = this;
    return {
      debtors: { count: debtors.count, amount: debtors.debt, link: debtors.link },
      onReview: { count: onReview.count, overdueCount: onReviewOverdue.count, link: onReview.link },
      expiring: { count: expiring.count, link: expiring.link },
      debtorsNoContact: { count: debtorsNoContact.count, link: debtorsNoContact.link },
      unreachable: { count: unreachable.count, link: unreachable.link },
    };
  }
}

export function collectionKpi(months: readonly CollectionMonth[]): KpiCollection {
  const last = months.at(-1);
  const previous = months.at(-2);
  const rate = last?.rate ?? null;
  const previousRate = previous?.rate ?? null;
  return {
    rate,
    previousRate,
    delta: rate === null || previousRate === null ? null : round2(rate - previousRate),
    month: last?.period ?? '',
  };
}
