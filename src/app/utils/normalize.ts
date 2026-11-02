import type { CardDraft, CitizenDraft, DraftRow } from 'types/form';

function patcher<T extends object>(row: T) {
  let next = row;
  return {
    set<K extends keyof T>(key: K, value: T[K]): void {
      if (next[key] === value) return;
      if (next === row) next = { ...row };
      next[key] = value;
    },
    get result(): T {
      return next;
    },
  };
}

export function normalizeCitizen(citizen: CitizenDraft): CitizenDraft {
  const row = patcher(citizen);
  if (citizen.gender !== 'female') row.set('previousLastName', null);
  if (citizen.status !== 'review') row.set('reviewReason', null);
  if (citizen.status !== 'duplicate') row.set('originalCardId', null);
  if (citizen.status !== 'archived') row.set('archiveReason', null);
  if (citizen.hasPersonalAccount !== true) row.set('personalAccountRegisteredAt', null);
  if (citizen.pdConsent !== true) {
    row.set('pdConsentDate', null);
    row.set('pdConsentUntil', null);
    row.set('smsConsent', false);
    row.set('emailConsent', false);
    row.set('surveyConsent', false);
    row.set('consentConfirmation', null);
  }
  return row.result;
}

export function normalizeContract(contract: DraftRow<'contracts'>): DraftRow<'contracts'> {
  const row = patcher(contract);
  if (contract.status !== 'terminated') {
    row.set('terminatedAt', null);
    row.set('terminationReason', null);
  }
  return row.result;
}

export function normalizeBenefit(benefit: DraftRow<'benefits'>): DraftRow<'benefits'> {
  const row = patcher(benefit);
  if (benefit.beneficiary !== 'familyMember') row.set('familyMemberId', null);
  if (benefit.verification !== 'rejected') row.set('rejectionReason', null);
  return row.result;
}

export function normalizeAttachment(attachment: DraftRow<'attachments'>): DraftRow<'attachments'> {
  const row = patcher(attachment);
  if (attachment.target === 'card') row.set('targetId', null);
  return row.result;
}

function mapSame<T>(items: T[], fn: (item: T) => T): T[] {
  const next = items.map(fn);
  return next.some((item, index) => item !== items[index]) ? next : items;
}

export function normalizeDraft(draft: CardDraft): CardDraft {
  const citizen = normalizeCitizen(draft.citizen);
  const contracts = mapSame(draft.related.contracts, normalizeContract);
  const benefits = mapSame(draft.related.benefits, normalizeBenefit);
  const attachments = mapSame(draft.related.attachments, normalizeAttachment);
  const { related } = draft;
  if (
    citizen === draft.citizen &&
    contracts === related.contracts &&
    benefits === related.benefits &&
    attachments === related.attachments
  ) {
    return draft;
  }
  return { citizen, related: { ...related, contracts, benefits, attachments } };
}
