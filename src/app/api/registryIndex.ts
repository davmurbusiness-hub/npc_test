import { CITIZENS } from 'data/citizens';
import { DEMO_TODAY } from 'data/config';
import { DICTIONARIES } from 'data/dictionaries';
import type { CitizenId, IsoDateTime } from 'types/common';
import type { CitizenCard, Payment } from 'types/entities';
import type { CitizenRow } from 'types/registry';
import type { Overlay, OverlayEntry } from 'types/storage';
import { applyChanges } from 'utils/card';
import type { CardContext } from 'utils/citizen';
import { toRow } from 'utils/citizen';
import { AggregateCells, aggregateGroupOf, sameGroup } from 'utils/dashboard';
import { isoToDays, periodIndexOfDays } from 'utils/isoDate';

import { normalizeName } from './listing/search';

export const CARD_CONTEXT: CardContext = { todayIso: DEMO_TODAY, districts: DICTIONARIES.district };

export interface RegistryIndex {
  rows: CitizenRow[];
  nameKeys: string[];
  aggregates: AggregateCells;
  overlay: Map<CitizenId, OverlayEntry>;
  latestUpdatedAt: IsoDateTime;
}

function moveAggregates(
  aggregates: AggregateCells,
  payments: readonly Payment[],
  before: CitizenRow,
  after: CitizenRow
): void {
  const from = aggregateGroupOf(before);
  const to = aggregateGroupOf(after);
  if (sameGroup(from, to)) return;
  aggregates.add(payments, from, -1);
  aggregates.add(payments, to, 1);
}

export function buildIndex(saved: Overlay): RegistryIndex {
  const aggregates = new AggregateCells(periodIndexOfDays(isoToDays(DEMO_TODAY)) - 1);
  const rows = CITIZENS.map((card) => {
    const row = toRow(card, DEMO_TODAY);
    aggregates.add(card.related.payments, aggregateGroupOf(row));
    return row;
  });
  const overlay = new Map<CitizenId, OverlayEntry>();
  for (const [key, entry] of Object.entries(saved.byCitizen)) {
    const id = Number(key);
    const before = rows[id - 1];
    const base = CITIZENS[id - 1];
    if (!Number.isInteger(id) || before === undefined || base === undefined) continue;
    try {
      const card = applyChanges(base, entry, CARD_CONTEXT, entry.updatedAt);
      const after = toRow(card, DEMO_TODAY);
      moveAggregates(aggregates, base.related.payments, before, after);
      rows[id - 1] = after;
      overlay.set(id, entry);
    } catch {
      continue;
    }
  }
  return {
    rows,
    nameKeys: rows.map((row) => normalizeName(row.searchName)),
    aggregates,
    overlay,
    latestUpdatedAt: rows.reduce(
      (latest, row) => (row.updatedAt > latest ? row.updatedAt : latest),
      ''
    ),
  };
}

export function commitCard(
  index: RegistryIndex,
  id: CitizenId,
  entry: OverlayEntry,
  card: CitizenCard
): void {
  const row = toRow(card, DEMO_TODAY);
  const before = index.rows[id - 1];
  if (before !== undefined) moveAggregates(index.aggregates, card.related.payments, before, row);
  index.overlay.set(id, entry);
  index.rows[id - 1] = row;
  index.nameKeys[id - 1] = normalizeName(row.searchName);
  if (row.updatedAt > index.latestUpdatedAt) index.latestUpdatedAt = row.updatedAt;
}
