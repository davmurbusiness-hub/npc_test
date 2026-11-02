import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkNotFuture, checkOrder, checkRequired, issueSink, requireWhen } from './rules';

import type { RowContext } from './rules';

export function validateContract(row: DraftRow<'contracts'>, ctx: RowContext): FieldIssue[] {
  const sink = issueSink('contracts', row.id);
  checkRequired(sink, row, ROW_REQUIRED.contracts);
  requireWhen(sink, 'terminatedAt', row.terminatedAt, row.status === 'terminated');
  checkNotFuture(sink, 'concludedAt', row.concludedAt, ctx.today);
  checkOrder(
    sink,
    'validUntil',
    row.concludedAt,
    row.validUntil,
    'Срок действия раньше заключения'
  );
  checkOrder(
    sink,
    'terminatedAt',
    row.concludedAt,
    row.terminatedAt,
    'Расторгнут раньше заключения'
  );
  return sink.list;
}
