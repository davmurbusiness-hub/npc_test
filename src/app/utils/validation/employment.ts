import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkNotFuture, checkOrder, checkRange, checkRequired, issueSink } from './rules';

import type { RowContext } from './rules';

export function validateEmployment(row: DraftRow<'employment'>, ctx: RowContext): FieldIssue[] {
  const sink = issueSink('employment', row.id);
  checkRequired(sink, row, ROW_REQUIRED.employment);
  checkNotFuture(sink, 'from', row.from, ctx.today);
  checkOrder(sink, 'to', row.from, row.to, '«По» раньше «с»');
  if (row.isCurrent === true && row.to !== null) {
    sink.add('to', 'consistency', 'У текущего места работы нет даты окончания');
  }
  checkRange(sink, 'income', row.income, 0, 100_000_000, 'Доход не может быть отрицательным');
  return sink.list;
}
