import type { RowId, IsoDateTime } from 'types/common';
import type { CardStatus, StatusTransitions } from 'types/dictionaries';
import type { CitizenCard, CitizenEditable, RelatedBase } from 'types/entities';
import type { CardDraft, CitizenDraft, DraftRow, RowDraft, FieldIssue } from 'types/form';
import type { CardChanges, EditableRowMap, EditableTableKey, RowChanges } from 'types/storage';
import { buildCard } from 'utils/citizen';
import type { CardContext, RelatedSource } from 'utils/citizen';

export const EDITABLE_TABLES: readonly EditableTableKey[] = [
  'addresses',
  'objects',
  'contracts',
  'familyMembers',
  'education',
  'employment',
  'benefits',
  'representatives',
  'attachments',
];

type NonNullKeys<T> = { [K in keyof T]-?: null extends T[K] ? never : K }[keyof T];

export type RequiredKeys<T> = Readonly<Record<NonNullKeys<T>, true>>;

type RowFields<K extends EditableTableKey> = Omit<EditableRowMap[K], keyof RelatedBase>;

export const CITIZEN_REQUIRED: RequiredKeys<CitizenEditable> = {
  lastName: true,
  firstName: true,
  gender: true,
  birthDate: true,
  citizenship: true,
  status: true,
  messenger: true,
  contactChannel: true,
  language: true,
  specialNeeds: true,
  documentType: true,
  documentSeries: true,
  documentNumber: true,
  documentIssuedAt: true,
  snils: true,
  maritalStatus: true,
  employmentStatus: true,
  disabilityGroup: true,
  govServicesAccount: true,
  hasPersonalAccount: true,
  receiptDelivery: true,
  autopay: true,
  eSignature: true,
  pdConsent: true,
  smsConsent: true,
  emailConsent: true,
  surveyConsent: true,
  responsibleId: true,
  source: true,
  tags: true,
  statusChangedAt: true,
};

export const ROW_REQUIRED: { [K in EditableTableKey]: RequiredKeys<RowFields<K>> } = {
  addresses: { type: true, isPrimary: true, region: true, city: true, street: true, house: true },
  objects: {
    accountNumber: true,
    type: true,
    addressId: true,
    area: true,
    rightType: true,
    residentsCount: true,
    pickupSchedule: true,
  },
  contracts: { contractNumber: true, objectId: true, concludedAt: true, status: true },
  familyMembers: { fullName: true, relation: true, birthDate: true, isDependent: true },
  education: { level: true, institution: true },
  employment: { organization: true, type: true, from: true, isCurrent: true },
  benefits: { kind: true, beneficiary: true, basisDocument: true, issuedAt: true },
  representatives: { fullName: true, type: true, validUntil: true, powers: true },
  attachments: {
    title: true,
    type: true,
    target: true,
    file: true,
    uploadedAt: true,
    uploadedBy: true,
  },
};

export function toDraft({ citizen, related }: CitizenCard): CardDraft {
  const {
    id: _id,
    cardNumber: _cardNumber,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    age: _age,
    dependentsCount: _dependentsCount,
    districtId: _districtId,
    benefitCategory: _benefitCategory,
    debt: _debt,
    ...editable
  } = citizen;

  return structuredClone({
    citizen: editable,
    related: {
      addresses: related.addresses,
      objects: related.objects.map(({ debt: _objectDebt, ...object }) => object),
      contracts: related.contracts,
      familyMembers: related.familyMembers,
      education: related.education,
      employment: related.employment,
      benefits: related.benefits,
      representatives: related.representatives,
      attachments: related.attachments,
    },
  });
}

export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item) => b.includes(item));
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

function sameRow(a: object, b: object): boolean {
  const left: Record<string, unknown> = { ...a };
  const right: Record<string, unknown> = { ...b };
  return Object.keys(left).every((key) => sameValue(left[key], right[key]));
}

export interface TableDiff<K extends EditableTableKey> {
  upserted: DraftRow<K>[];
  deletedIds: RowId[];
}

export interface DraftDiff {
  citizen: Partial<CitizenDraft>;
  related: { [K in EditableTableKey]?: TableDiff<K> };
}

function diffTable<K extends EditableTableKey>(
  table: K,
  base: CardDraft,
  next: CardDraft,
  into: DraftDiff['related']
): void {
  const before = new Map(base.related[table].map((row) => [row.id, row]));
  const after = new Set(next.related[table].map((row) => row.id));
  const upserted = next.related[table].filter((row) => {
    const prev = before.get(row.id);
    return prev === undefined || !sameRow(prev, row);
  });
  const deletedIds = [...before.keys()].filter((id) => !after.has(id));
  if (upserted.length > 0 || deletedIds.length > 0) {
    Object.assign(into, { [table]: { upserted, deletedIds } });
  }
}

export function diffDraft(base: CardDraft, next: CardDraft): DraftDiff {
  const citizen: Partial<CitizenDraft> = {};
  const baseCitizen: Record<string, unknown> = { ...base.citizen };
  for (const [key, value] of Object.entries(next.citizen)) {
    if (!sameValue(baseCitizen[key], value)) Object.assign(citizen, { [key]: value });
  }
  const related: DraftDiff['related'] = {};
  for (const table of EDITABLE_TABLES) diffTable(table, base, next, related);
  return { citizen, related };
}

export function isEmptyDiff(diff: DraftDiff): boolean {
  return Object.keys(diff.citizen).length === 0 && Object.keys(diff.related).length === 0;
}

function filled(values: object, required: object): boolean {
  const record: Record<string, unknown> = { ...values };
  return Object.keys(required).every((key) => !(key in record) || record[key] !== null);
}

function isCitizenComplete(
  citizen: Partial<CitizenDraft>
): citizen is Partial<RowDraft<CitizenEditable>> & Partial<CitizenEditable> {
  return filled(citizen, CITIZEN_REQUIRED);
}

function isRowComplete<K extends EditableTableKey>(
  table: K,
  row: DraftRow<K>
): row is DraftRow<K> & EditableRowMap[K] {
  const record: Record<string, unknown> = { ...row };
  return Object.keys(ROW_REQUIRED[table]).every((key) => record[key] !== null);
}

function completeTable<K extends EditableTableKey>(
  table: K,
  diff: TableDiff<K>
): RowChanges<EditableRowMap[K]> | null {
  const upserted: EditableRowMap[K][] = [];
  for (const row of diff.upserted) {
    if (!isRowComplete(table, row)) return null;
    upserted.push(row);
  }
  return { upserted, deletedIds: diff.deletedIds };
}

function putTable<K extends EditableTableKey>(
  table: K,
  diff: DraftDiff['related'],
  into: NonNullable<CardChanges['related']>
): boolean {
  const tableDiff = diff[table];
  if (tableDiff === undefined) return true;
  const changes = completeTable(table, tableDiff);
  if (changes === null) return false;
  Object.assign(into, { [table]: changes });
  return true;
}

export function toCardChanges(diff: DraftDiff): CardChanges | null {
  if (!isCitizenComplete(diff.citizen)) return null;
  const related: NonNullable<CardChanges['related']> = {};
  for (const table of EDITABLE_TABLES) {
    if (!putTable(table, diff.related, related)) return null;
  }
  const changes: CardChanges = {};
  if (Object.keys(diff.citizen).length > 0) changes.citizen = diff.citizen;
  if (Object.keys(related).length > 0) changes.related = related;
  return changes;
}

export function withField<T, F extends keyof T>(row: T, field: F, value: T[F]): T {
  const next = { ...row };
  next[field] = value;
  return next;
}

export function withTable<K extends EditableTableKey>(
  draft: CardDraft,
  table: K,
  rows: DraftRow<K>[]
): CardDraft {
  const related = { ...draft.related };
  Object.assign(related, { [table]: rows });
  return { citizen: draft.citizen, related };
}

export const STATUS_TRANSITIONS: StatusTransitions = {
  active: ['review', 'archived', 'duplicate'],
  review: ['active', 'archived', 'duplicate'],
  archived: ['active'],
  duplicate: ['archived'],
};

export function allowedStatuses(from: CardStatus): readonly CardStatus[] {
  return [from, ...STATUS_TRANSITIONS[from]];
}

export const fieldKey = (table: string, rowId: RowId | null, field: string): string =>
  `${table}:${rowId ?? ''}:${field}`;

export const issueKey = (issue: FieldIssue): string =>
  fieldKey(issue.table, issue.rowId, issue.field);

export const rowTouchKey = (table: string, rowId: RowId | null): string =>
  fieldKey(table, rowId, '*');

function applyRows<T extends RelatedBase>(
  rows: readonly T[],
  changes: { upserted: readonly T[]; deletedIds: readonly RowId[] } | undefined
): T[] {
  if (changes === undefined) return [...rows];
  const deleted = new Set(changes.deletedIds);
  const upserted = new Map(changes.upserted.map((row) => [row.id, row]));
  const next = rows.filter((row) => !deleted.has(row.id)).map((row) => upserted.get(row.id) ?? row);
  const known = new Set(rows.map((row) => row.id));
  for (const row of changes.upserted) {
    if (!known.has(row.id) && !deleted.has(row.id)) next.push(row);
  }
  return next;
}

function applyTable<K extends EditableTableKey>(
  table: K,
  card: CitizenCard,
  changes: CardChanges,
  into: RelatedSource
): void {
  Object.assign(into, { [table]: applyRows(card.related[table], changes.related?.[table]) });
}

export function applyChanges(
  card: CitizenCard,
  changes: CardChanges,
  ctx: CardContext,
  updatedAt?: IsoDateTime
): CitizenCard {
  const related: RelatedSource = { ...card.related };
  for (const table of EDITABLE_TABLES) applyTable(table, card, changes, related);
  const citizen = {
    ...card.citizen,
    ...changes.citizen,
    updatedAt: updatedAt ?? card.citizen.updatedAt,
  };
  return buildCard(citizen, related, ctx);
}
