import { DICTIONARIES } from 'data/dictionaries';
import type { Rubles } from 'types/common';
import type { BenefitKindStat } from 'types/dashboard';
import type { BenefitKind, BenefitVerification } from 'types/dictionaries';
import type { CitizenRow } from 'types/registry';
import { round2 } from 'utils/format';

import type { Collector, Counter, DashboardContext } from './counter';

type Segment = keyof BenefitKindStat['links'];

const SEGMENTS: readonly (readonly [Segment, BenefitVerification])[] = [
  ['confirmed', 'confirmed'],
  ['onReview', 'onReview'],
  ['expired', 'expired'],
];

interface Entry {
  segments: Record<Segment, Counter>;
  discount: Rubles;
}

export class BenefitsCollector implements Collector<BenefitKindStat[]> {
  private readonly entries: ReadonlyMap<BenefitKind, Entry>;
  private readonly scope: Counter;

  constructor(ctx: DashboardContext) {
    this.scope = ctx.counter({});
    this.entries = new Map(
      DICTIONARIES.benefitKind.map(({ value }) => {
        const kind = value as BenefitKind;
        const segments = Object.fromEntries(
          SEGMENTS.map(([segment, verification]) => [
            segment,
            ctx.counter({ benefitKinds: [kind], benefitVerification: [verification] }),
          ])
        ) as Record<Segment, Counter>;
        return [kind, { segments, discount: 0 }];
      })
    );
  }

  add(row: CitizenRow): void {
    if (row.benefits.length === 0 || !this.scope.matches(row)) return;
    const seen = new Set<BenefitKind>();
    for (const benefit of row.benefits) {
      const entry = this.entries.get(benefit.kind);
      if (entry === undefined) continue;
      entry.discount += benefit.monthlyDiscount;
      if (seen.has(benefit.kind)) continue;
      seen.add(benefit.kind);
      for (const [segment] of SEGMENTS) entry.segments[segment].add(row);
    }
  }

  result(): BenefitKindStat[] {
    return [...this.entries].map(([kind, { segments, discount }]) => ({
      kind,
      confirmed: segments.confirmed.count,
      onReview: segments.onReview.count,
      expired: segments.expired.count,
      monthlyDiscount: round2(discount),
      links: {
        confirmed: segments.confirmed.link,
        onReview: segments.onReview.link,
        expired: segments.expired.link,
      },
    }));
  }
}
