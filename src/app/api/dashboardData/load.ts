import { DICTIONARIES } from 'data/dictionaries';
import type { DictValue } from 'types/common';
import type { ResponsibleLoad, ResponsibleLoadMetric } from 'types/dashboard';
import type { CitizenFilters, CitizenRow } from 'types/registry';
import { NO_CONTACT_DAYS, REVIEW_OVERDUE_DAYS } from 'utils/dashboard';

import type { Collector, Counter, DashboardContext } from './counter';

const METRICS: readonly (readonly [ResponsibleLoadMetric, CitizenFilters])[] = [
  ['cards', {}],
  ['onReview', { status: ['review'] }],
  ['onReviewOver14', { status: ['review'], onReviewDays: REVIEW_OVERDUE_DAYS }],
  ['debtorsNoContact', { hasDebt: true, noContactDays: NO_CONTACT_DAYS }],
];

type Counters = Record<ResponsibleLoadMetric, Counter>;

export class LoadCollector implements Collector<ResponsibleLoad[]> {
  private readonly entries: ReadonlyMap<DictValue, Counters>;

  constructor(ctx: DashboardContext) {
    this.entries = new Map(
      DICTIONARIES.responsible.map(({ value }) => [
        value,
        Object.fromEntries(
          METRICS.map(([metric, filters]) => [
            metric,
            ctx.counter({ ...filters, responsibleIds: [value] }, { responsible: false }),
          ])
        ) as Counters,
      ])
    );
  }

  add(row: CitizenRow): void {
    const counters = this.entries.get(row.responsibleId);
    if (counters === undefined || !counters.cards.add(row)) return;
    counters.onReview.add(row);
    counters.onReviewOver14.add(row);
    counters.debtorsNoContact.add(row);
  }

  result(): ResponsibleLoad[] {
    return [...this.entries].map(([responsibleId, counters]) => ({
      responsibleId,
      cards: counters.cards.count,
      onReview: counters.onReview.count,
      onReviewOver14: counters.onReviewOver14.count,
      debtorsNoContact: counters.debtorsNoContact.count,
      links: {
        cards: counters.cards.link,
        onReview: counters.onReview.link,
        onReviewOver14: counters.onReviewOver14.link,
        debtorsNoContact: counters.debtorsNoContact.link,
      },
    }));
  }
}
