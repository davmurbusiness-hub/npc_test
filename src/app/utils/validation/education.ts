import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkRange, checkRequired, issueSink, yearOf } from './rules';

import type { RowContext } from './rules';

export function validateEducation(row: DraftRow<'education'>, ctx: RowContext): FieldIssue[] {
  const sink = issueSink('education', row.id);
  checkRequired(sink, row, ROW_REQUIRED.education);

  const thisYear = yearOf(ctx.today) ?? 0;
  const message = `Год от 1900 до ${thisYear + 10}`;
  checkRange(
    sink,
    'admissionYear',
    row.admissionYear,
    1900,
    thisYear,
    `Год от 1900 до ${thisYear}`
  );
  checkRange(sink, 'graduationYear', row.graduationYear, 1900, thisYear + 10, message);

  const birthYear = yearOf(ctx.citizen.birthDate);
  if (birthYear !== null && row.admissionYear !== null && row.admissionYear < birthYear + 15) {
    sink.add('admissionYear', 'order', `Не раньше ${birthYear + 15} года (15 лет)`);
  }
  if (
    row.admissionYear !== null &&
    row.graduationYear !== null &&
    row.graduationYear < row.admissionYear + 2
  ) {
    sink.add('graduationYear', 'order', 'Не раньше чем через 2 года после поступления');
  }
  return sink.list;
}
