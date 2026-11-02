import type { IsoDate } from 'types/common';
import type { DashboardFilters, DashboardQuery } from 'types/dashboard';
import type { Dictionaries, DeadlineTone } from 'types/dictionaries';
import { isoToDays } from 'utils/isoDate';
import type { QueryParams, QueryParamsPatch } from 'utils/registry';

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  districtId: null,
  responsibleId: null,
};

function codeOf(
  value: string | undefined,
  dictionaries: Dictionaries,
  key: 'district' | 'responsible'
): string | null {
  return value !== undefined && dictionaries[key].some((item) => item.value === value)
    ? value
    : null;
}

export function parseDashboardParams(
  params: QueryParams,
  dictionaries: Dictionaries
): DashboardFilters {
  return {
    districtId: codeOf(params.district?.[0], dictionaries, 'district'),
    responsibleId: codeOf(params.responsible?.[0], dictionaries, 'responsible'),
  };
}

export function toDashboardParams({
  districtId,
  responsibleId,
}: DashboardFilters): QueryParamsPatch {
  return { district: districtId, responsible: responsibleId };
}

export const toDashboardQuery = ({
  districtId,
  responsibleId,
}: DashboardFilters): DashboardQuery => ({ districtId, responsibleId });

export const EXPIRING_WITHIN_DAYS = 30;

export const REVIEW_OVERDUE_DAYS = 14;

export const DEADLINE_SOON_DAYS = 7;

export function deadlineTone(date: IsoDate | null, today: IsoDate): DeadlineTone {
  if (date === null) return 'none';
  if (date < today) return 'overdue';
  return isoToDays(date) - isoToDays(today) <= DEADLINE_SOON_DAYS ? 'soon' : 'none';
}
