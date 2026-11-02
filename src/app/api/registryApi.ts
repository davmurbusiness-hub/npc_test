import { CITIZENS } from 'data/citizens';
import { DEMO_TODAY } from 'data/config';
import { DICTIONARIES } from 'data/dictionaries';
import type { RegistryApi, SaveResult } from 'types/api';
import type { CitizenId, IsoDate } from 'types/common';
import type { Dictionaries } from 'types/dictionaries';
import type { CitizenCard } from 'types/entities';
import type { CardDraft } from 'types/form';
import type { CitizenRow } from 'types/registry';
import type { OverlayEntry } from 'types/storage';
import { applyChanges, diffDraft, toCardChanges, toDraft } from 'utils/card';
import { normalizeDraft } from 'utils/normalize';
import { toPreview } from 'utils/preview';
import { demoNow, nextUpdatedAt, originalCardIssues, sanitizeChanges } from 'utils/saveCard';
import { hasErrors, validateCard } from 'utils/validation';

import { buildDashboard } from './dashboardData/buildDashboard';
import { ApiError } from './errors';
import { CitizenListing } from './listing/listCitizens';
import { loadOverlay, saveOverlayEntry } from './overlayStorage';
import { queryClient } from './queryClient';
import { CARD_CONTEXT, buildIndex, commitCard } from './registryIndex';
import { registryKeys } from './registryKeys';

import type { RegistryIndex } from './registryIndex';

export interface RegistryClient extends Pick<
  RegistryApi,
  'listCitizens' | 'getPreview' | 'getCard' | 'saveCard' | 'findBySnils' | 'getDashboard'
> {
  readonly dictionaries: Dictionaries;
  readonly today: IsoDate;
}

let index: RegistryIndex | null = null;
let listing: CitizenListing | null = null;

function registry(): RegistryIndex {
  index ??= buildIndex(loadOverlay());
  return index;
}

function listingOf(current: RegistryIndex): CitizenListing {
  listing ??= new CitizenListing(current.rows, current.nameKeys, DEMO_TODAY);
  return listing;
}

function baseCard(id: CitizenId): CitizenCard {
  const card = CITIZENS[id - 1];
  if (!Number.isInteger(id) || card === undefined) {
    throw new ApiError('notFound', `Гражданин ${id} не найден`);
  }
  return card;
}

function currentCard(id: CitizenId): CitizenCard {
  const base = baseCard(id);
  const entry = registry().overlay.get(id);
  return entry === undefined ? base : applyChanges(base, entry, CARD_CONTEXT, entry.updatedAt);
}

const saveCard: RegistryClient['saveCard'] = async (id, changes): Promise<SaveResult> => {
  const current = registry();
  const card = currentCard(id);
  const previousStatus = card.citizen.status;

  let draft: CardDraft = normalizeDraft(
    toDraft(applyChanges(card, sanitizeChanges(id, changes), CARD_CONTEXT))
  );
  if (draft.citizen.status !== previousStatus) {
    draft = { ...draft, citizen: { ...draft.citizen, statusChangedAt: DEMO_TODAY } };
  }

  const issues = [
    ...validateCard(draft, {
      today: DEMO_TODAY,
      citizenId: id,
      previousStatus,
      payments: card.related.payments,
    }),
    ...originalCardIssues(draft, id, current.rows.length),
  ];
  if (hasErrors(issues)) return { ok: false, issues };

  const base = baseCard(id);
  const fromBase = toCardChanges(diffDraft(toDraft(base), draft));
  if (fromBase === null) {
    throw new ApiError('internal', 'Проверенная карточка содержит пустые обязательные поля');
  }
  const entry: OverlayEntry = {
    ...fromBase,
    updatedAt: nextUpdatedAt(DEMO_TODAY, current.latestUpdatedAt),
  };
  const saved = applyChanges(base, entry, CARD_CONTEXT, entry.updatedAt);
  commitCard(current, id, entry, saved);
  listing = null;
  saveOverlayEntry(id, entry);
  await queryClient.invalidateQueries({ queryKey: registryKeys.all });
  queryClient.setQueryData(registryKeys.card(id), saved);
  return { ok: true, card: saved };
};

export const registryApi: RegistryClient = {
  dictionaries: DICTIONARIES,
  today: DEMO_TODAY,

  listCitizens: (query) =>
    queryClient.fetchQuery({
      queryKey: registryKeys.list(query),
      queryFn: () => listingOf(registry()).list(query),
    }),

  getPreview: (id) =>
    queryClient.fetchQuery({
      queryKey: registryKeys.preview(id),
      queryFn: () => toPreview(currentCard(id)),
    }),

  getCard: (id) =>
    queryClient.fetchQuery({
      queryKey: registryKeys.card(id),
      queryFn: () => currentCard(id),
    }),

  saveCard,

  findBySnils: async (snils, excludeId) => {
    if (!/^\d{11}$/.test(snils)) return null;
    let found: CitizenRow | null = null;
    for (const row of registry().rows) {
      if (row.snils !== snils || row.id === excludeId) continue;
      found = row;
      if (row.status !== 'duplicate') break;
    }
    if (found === null) return null;
    return {
      snils,
      existingId: found.id,
      existingCardNumber: found.cardNumber,
      existingFullName: found.fullName,
    };
  },

  getDashboard: (query) =>
    queryClient.fetchQuery({
      queryKey: registryKeys.dashboard(query),
      queryFn: () => {
        const { rows, aggregates } = registry();
        return buildDashboard(rows, aggregates, DEMO_TODAY, query, demoNow(DEMO_TODAY));
      },
    }),
};
