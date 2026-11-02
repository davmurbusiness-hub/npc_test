import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkNotFuture, checkRange, checkRequired, issueSink } from './rules';

import type { RowContext } from './rules';

export function validateObject(row: DraftRow<'objects'>, ctx: RowContext): FieldIssue[] {
  const sink = issueSink('objects', row.id);
  checkRequired(sink, row, ROW_REQUIRED.objects);
  if (row.area !== null && !(row.area > 0)) sink.add('area', 'range', 'Площадь больше 0');
  checkRange(sink, 'area', row.area, 0, 100_000, 'Площадь не больше 100 000 м²');
  if (row.residentsCount !== null && !Number.isInteger(row.residentsCount)) {
    sink.add('residentsCount', 'format', 'Целое число');
  }
  checkRange(sink, 'residentsCount', row.residentsCount, 1, 100, 'От 1 до 100 человек');
  checkRange(sink, 'share', row.share, 0, 100, 'Доля от 0 до 100 %');
  checkRange(sink, 'tariff', row.tariff, 0, 1_000_000, 'Тариф не может быть отрицательным');
  checkNotFuture(sink, 'billingStartDate', row.billingStartDate, ctx.today);
  return sink.list;
}
