import { CITIZENS } from 'data/citizens';
import { DEMO_TODAY } from 'data/config';
import { DICTIONARIES } from 'data/dictionaries';
import type { CitizenId, IsoDateTime } from 'types/common';
import type { CitizenCard } from 'types/entities';
import type { CitizenRow } from 'types/registry';
import type { Overlay, OverlayEntry } from 'types/storage';
import { applyChanges } from 'utils/card';
import type { CardContext } from 'utils/citizen';
import { toRow } from 'utils/citizen';

import { normalizeName } from './listing/search';

export const CARD_CONTEXT: CardContext = { todayIso: DEMO_TODAY, districts: DICTIONARIES.district };

export interface RegistryIndex {
  rows: CitizenRow[];
  nameKeys: string[];
  overlay: Map<CitizenId, OverlayEntry>;
  latestUpdatedAt: IsoDateTime;
}

export function buildIndex(saved: Overlay): RegistryIndex {
  const rows = CITIZENS.map((card) => toRow(card, DEMO_TODAY));
  const overlay = new Map<CitizenId, OverlayEntry>();
  for (const [key, entry] of Object.entries(saved.byCitizen)) {
    const id = Number(key);
    const existing = rows[id - 1];
    const base = CITIZENS[id - 1];
    if (!Number.isInteger(id) || existing === undefined || base === undefined) continue;
    try {
      const card = applyChanges(base, entry, CARD_CONTEXT, entry.updatedAt);
      const after = toRow(card, DEMO_TODAY);
      rows[id - 1] = after;
      overlay.set(id, entry);
    } catch {
      continue;
    }
  }
  return {
    rows,
    nameKeys: rows.map((row) => normalizeName(row.searchName)),
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
  index.overlay.set(id, entry);
  index.rows[id - 1] = row;
  index.nameKeys[id - 1] = normalizeName(row.searchName);
  if (row.updatedAt > index.latestUpdatedAt) index.latestUpdatedAt = row.updatedAt;
}
