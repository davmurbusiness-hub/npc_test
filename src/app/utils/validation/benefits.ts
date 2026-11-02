import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import {
  checkNotFuture,
  checkOrder,
  checkRange,
  checkRequired,
  issueSink,
  requireWhen,
} from './rules';

import type { RowContext } from './rules';

export function validateBenefit(row: DraftRow<'benefits'>, ctx: RowContext): FieldIssue[] {
  const sink = issueSink('benefits', row.id);
  checkRequired(sink, row, ROW_REQUIRED.benefits);
  requireWhen(sink, 'familyMemberId', row.familyMemberId, row.beneficiary === 'familyMember');
  requireWhen(sink, 'rejectionReason', row.rejectionReason, row.verification === 'rejected');
  checkNotFuture(sink, 'issuedAt', row.issuedAt, ctx.today);
  checkOrder(sink, 'validTo', row.validFrom, row.validTo, '«Действует по» раньше «действует с»');
  checkRange(sink, 'discountPercent', row.discountPercent, 0, 100, 'Скидка от 0 до 100 %');
  return sink.list;
}
