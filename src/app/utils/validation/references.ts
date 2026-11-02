import type { RowId } from 'types/common';
import type { Payment } from 'types/entities';
import type { CardDraft, DraftRow, FieldIssue } from 'types/form';
import type { EditableTableKey } from 'types/storage';

import { issueSink } from './rules';

import type { ValidationContext } from './rules';

export function validateReferences(draft: CardDraft, ctx: ValidationContext): FieldIssue[] {
  const { related } = draft;
  const list: FieldIssue[] = [];
  const ids = (rows: readonly { id: RowId }[]) => new Set(rows.map((row) => row.id));
  const addresses = ids(related.addresses);
  const objects = ids(related.objects);
  const members = ids(related.familyMembers);
  const benefits = ids(related.benefits);
  const representatives = ids(related.representatives);
  const missing = 'Строка, на которую ссылается поле, удалена';

  for (const row of related.objects) {
    if (row.addressId !== null && !addresses.has(row.addressId)) {
      issueSink('objects', row.id, list).add('addressId', 'referenced', missing);
    }
  }
  for (const row of related.contracts) {
    if (row.objectId !== null && !objects.has(row.objectId)) {
      issueSink('contracts', row.id, list).add('objectId', 'referenced', missing);
    }
  }
  for (const row of related.familyMembers) {
    if (row.objectId !== null && !objects.has(row.objectId)) {
      issueSink('familyMembers', row.id, list).add('objectId', 'referenced', missing);
    }
  }
  for (const row of related.benefits) {
    if (row.familyMemberId !== null && !members.has(row.familyMemberId)) {
      issueSink('benefits', row.id, list).add('familyMemberId', 'referenced', missing);
    }
  }
  const targets = { object: objects, benefit: benefits, representative: representatives };
  for (const row of related.attachments) {
    if (row.target === null || row.target === 'card' || row.targetId === null) continue;
    if (!targets[row.target].has(row.targetId)) {
      issueSink('attachments', row.id, list).add('targetId', 'referenced', missing);
    }
  }
  const orphan = new Set(
    ctx.payments.map((payment) => payment.objectId).filter((id) => !objects.has(id))
  );
  for (const objectId of orphan) {
    issueSink('objects', objectId, list).add('id', 'referenced', 'По объекту есть платежи');
  }
  return list;
}

export function deleteBlocker(
  draft: CardDraft,
  table: EditableTableKey,
  rowId: RowId,
  payments: readonly Pick<Payment, 'objectId'>[]
): string | null {
  const { related } = draft;
  switch (table) {
    case 'addresses':
      return related.objects.some((object) => object.addressId === rowId)
        ? 'Адрес указан у объекта — сначала смените адрес объекта'
        : null;
    case 'objects':
      if (payments.some((payment) => payment.objectId === rowId)) {
        return 'По объекту есть платежи — удалить нельзя';
      }
      return related.contracts.some((contract) => contract.objectId === rowId)
        ? 'По объекту есть договор — сначала удалите договор'
        : null;
    case 'familyMembers':
      return related.benefits.some((benefit) => benefit.familyMemberId === rowId)
        ? 'На члена семьи оформлена льгота — сначала удалите льготу'
        : null;
    case 'contracts':
    case 'education':
    case 'employment':
    case 'benefits':
    case 'representatives':
    case 'attachments':
      return null;
  }
}

function withoutRow<K extends EditableTableKey>(
  related: CardDraft['related'],
  table: K,
  rowId: RowId
): DraftRow<K>[] {
  return related[table].filter((row) => row.id !== rowId);
}

export function removeRow(draft: CardDraft, table: EditableTableKey, rowId: RowId): CardDraft {
  const related: CardDraft['related'] = { ...draft.related };
  Object.assign(related, { [table]: withoutRow(draft.related, table, rowId) });

  const target =
    table === 'objects'
      ? 'object'
      : table === 'benefits'
        ? 'benefit'
        : table === 'representatives'
          ? 'representative'
          : null;
  if (target !== null) {
    related.attachments = related.attachments.filter(
      (row) => !(row.target === target && row.targetId === rowId)
    );
  }
  if (table === 'objects') {
    related.familyMembers = related.familyMembers.map((member) =>
      member.objectId === rowId ? { ...member, objectId: null } : member
    );
  }
  return { citizen: draft.citizen, related };
}
