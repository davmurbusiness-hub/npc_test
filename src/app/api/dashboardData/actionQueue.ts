import type { IsoDate } from 'types/common';
import type { ActionQueueItem, ActionQueueKind } from 'types/dashboard';
import type { DeadlineTone, ExpiryKind } from 'types/dictionaries';
import type { CitizenFilters, CitizenRow } from 'types/registry';
import { EXPIRING_WITHIN_DAYS, REVIEW_OVERDUE_DAYS, deadlineTone } from 'utils/dashboard';

import type { Collector, Counter, DashboardContext } from './counter';

type ToneRule = { expiry: ExpiryKind } | 'overdue' | 'none';

const expiring = (kind: ExpiryKind): CitizenFilters => ({
  expiringKinds: [kind],
  expiringWithinDays: EXPIRING_WITHIN_DAYS,
});

const ITEMS: readonly { kind: ActionQueueKind; filters: CitizenFilters; tone: ToneRule }[] = [
  { kind: 'documentExpiring', filters: expiring('document'), tone: { expiry: 'document' } },
  { kind: 'noConsent', filters: { noValidConsent: true }, tone: 'overdue' },
  {
    kind: 'reviewOver14',
    filters: { status: ['review'], onReviewDays: REVIEW_OVERDUE_DAYS },
    tone: 'overdue',
  },
  { kind: 'duplicatesToMerge', filters: { status: ['duplicate'] }, tone: 'none' },
];

interface Entry {
  kind: ActionQueueKind;
  counter: Counter;
  tone: ToneRule;
  earliest: IsoDate | null;
}

export class ActionQueueCollector implements Collector<ActionQueueItem[]> {
  private readonly entries: Entry[];
  private readonly todayIso: IsoDate;

  constructor(ctx: DashboardContext) {
    this.todayIso = ctx.todayIso;
    this.entries = ITEMS.map(({ kind, filters, tone }) => ({
      kind,
      counter: ctx.counter(filters),
      tone,
      earliest: null,
    }));
  }

  add(row: CitizenRow): void {
    for (const entry of this.entries) {
      if (!entry.counter.add(row) || typeof entry.tone !== 'object') continue;
      const date = row.expiresAt[entry.tone.expiry];
      if (date !== null && (entry.earliest === null || date < entry.earliest)) {
        entry.earliest = date;
      }
    }
  }

  result(): ActionQueueItem[] {
    return this.entries.map(({ kind, counter, tone, earliest }) => ({
      kind,
      count: counter.count,
      tone: this.toneOf(counter.count, tone, earliest),
      link: counter.link,
    }));
  }

  private toneOf(count: number, rule: ToneRule, earliest: IsoDate | null): DeadlineTone {
    if (count === 0 || rule === 'none') return 'none';
    if (rule === 'overdue') return 'overdue';
    return deadlineTone(earliest, this.todayIso);
  }
}
