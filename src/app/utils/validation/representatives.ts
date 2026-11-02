import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import {
  checkCyrillic,
  checkMask,
  checkNotFuture,
  checkOrder,
  checkRequired,
  issueSink,
} from './rules';

import type { RowContext } from './rules';

export function validateRepresentative(
  row: DraftRow<'representatives'>,
  ctx: RowContext
): FieldIssue[] {
  const sink = issueSink('representatives', row.id);
  checkRequired(sink, row, ROW_REQUIRED.representatives);
  checkCyrillic(sink, 'fullName', row.fullName);
  checkNotFuture(sink, 'issuedAt', row.issuedAt, ctx.today);
  checkOrder(sink, 'validUntil', row.issuedAt, row.validUntil, 'Срок действия раньше выдачи');
  checkMask(
    sink,
    'documentSeriesNumber',
    row.documentSeriesNumber,
    'seriesNumber',
    'Серия и номер — 10 цифр'
  );
  return sink.list;
}
