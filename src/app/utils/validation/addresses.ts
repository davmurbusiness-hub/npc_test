import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkMask, checkOrder, checkRequired, issueSink } from './rules';

import type { RowContext } from './rules';

export function validateAddress(row: DraftRow<'addresses'>, _ctx: RowContext): FieldIssue[] {
  const sink = issueSink('addresses', row.id);
  checkRequired(sink, row, ROW_REQUIRED.addresses);
  checkMask(sink, 'postalCode', row.postalCode, 'postalCode', 'Индекс — 6 цифр');
  checkOrder(sink, 'validTo', row.validFrom, row.validTo, '«Действует по» раньше «действует с»');
  return sink.list;
}
