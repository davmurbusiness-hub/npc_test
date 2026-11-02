import type { DashboardKpi } from 'types/dashboard';
import type { CitizenRow } from 'types/registry';
import { EXPIRING_WITHIN_DAYS, REVIEW_OVERDUE_DAYS } from 'utils/dashboard';

import type { Collector, Counter, DashboardContext } from './counter';

export class KpiCollector implements Collector<DashboardKpi> {
  private readonly onReview: Counter;
  private readonly onReviewOverdue: Counter;
  private readonly expiring: Counter;

  constructor(ctx: DashboardContext) {
    this.onReview = ctx.counter({ status: ['review'] });
    this.onReviewOverdue = ctx.counter({ status: ['review'], onReviewDays: REVIEW_OVERDUE_DAYS });
    this.expiring = ctx.counter({ expiringWithinDays: EXPIRING_WITHIN_DAYS });
  }

  add(row: CitizenRow): void {
    if (this.onReview.add(row)) this.onReviewOverdue.add(row);
    this.expiring.add(row);
  }

  result(): DashboardKpi {
    const { onReview, onReviewOverdue, expiring } = this;
    return {
      onReview: { count: onReview.count, overdueCount: onReviewOverdue.count, link: onReview.link },
      expiring: { count: expiring.count, link: expiring.link },
    };
  }
}
