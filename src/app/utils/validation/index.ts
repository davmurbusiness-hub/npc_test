import type { CardDraft, DraftRow, FieldIssue } from 'types/form';
import type { EditableTableKey } from 'types/storage';
import { EDITABLE_TABLES } from 'utils/card';

import { validateAddress } from './addresses';
import { validateAttachment } from './attachments';
import { validateBenefit } from './benefits';
import { validateCitizen } from './citizen';
import { validateConsistency } from './consistency';
import { validateContract } from './contracts';
import { validateEducation } from './education';
import { validateEmployment } from './employment';
import { validateFamilyMember } from './familyMembers';
import { validateObject } from './objects';
import { validateReferences } from './references';
import { validateRepresentative } from './representatives';

import type { RowContext, ValidationContext } from './rules';

export { deleteBlocker, removeRow } from './references';
export { ageOn, isValidSnils } from './rules';
export type { RowContext, ValidationContext } from './rules';

const ROW_VALIDATORS: {
  [K in EditableTableKey]: (row: DraftRow<K>, ctx: RowContext) => FieldIssue[];
} = {
  addresses: validateAddress,
  objects: validateObject,
  contracts: validateContract,
  familyMembers: validateFamilyMember,
  education: validateEducation,
  employment: validateEmployment,
  benefits: validateBenefit,
  representatives: validateRepresentative,
  attachments: validateAttachment,
};

export function validateRow<K extends EditableTableKey>(
  table: K,
  row: DraftRow<K>,
  ctx: RowContext
): FieldIssue[] {
  const validate: (row: DraftRow<K>, ctx: RowContext) => FieldIssue[] = ROW_VALIDATORS[table];
  return validate(row, ctx);
}

function validateTable<K extends EditableTableKey>(
  table: K,
  draft: CardDraft,
  ctx: RowContext
): FieldIssue[] {
  return draft.related[table].flatMap((row) => validateRow(table, row, ctx));
}

export function validateCard(draft: CardDraft, ctx: ValidationContext): FieldIssue[] {
  const rowCtx: RowContext = { today: ctx.today, citizen: draft.citizen };
  return [
    ...validateCitizen(draft.citizen, ctx),
    ...EDITABLE_TABLES.flatMap((table) => validateTable(table, draft, rowCtx)),
    ...validateConsistency(draft, ctx),
    ...validateReferences(draft, ctx),
  ];
}

export const hasErrors = (issues: readonly FieldIssue[]): boolean =>
  issues.some((issue) => issue.severity === 'error');
