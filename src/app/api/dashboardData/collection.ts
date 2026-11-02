import type { CollectionMonth, DashboardQuery } from 'types/dashboard';
import type { AggregateCells } from 'utils/dashboard';

import { percentOf } from './counter';

export function collectionMonths(
  aggregates: AggregateCells,
  { districtId, responsibleId }: DashboardQuery
): CollectionMonth[] {
  return aggregates
    .totals(
      (group) =>
        (districtId === null || group.districtId === districtId) &&
        (responsibleId === null || group.responsibleId === responsibleId)
    )
    .map((total) => ({ ...total, rate: percentOf(total.paidOnTime, total.charged) }));
}
