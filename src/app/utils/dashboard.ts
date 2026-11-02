import type { DictValue, Rubles, YearMonth, IsoDate } from 'types/common';
import type { DashboardFilters, DashboardQuery } from 'types/dashboard';
import type { CardStatus, Dictionaries, PeriodMonths, DeadlineTone } from 'types/dictionaries';
import type { Payment } from 'types/entities';
import { isoToDays, periodFromIndex, periodIndex, periodStartDays, daysToIso } from 'utils/isoDate';
import type { QueryParams, QueryParamsPatch } from 'utils/registry';

export const NO_DISTRICT = 'none';

export const AGGREGATE_MONTHS = 12;

export const PAYMENT_DUE_DAY = 10;

export function paymentDueDays(period: YearMonth): number {
  return periodStartDays(periodIndex(period) + 1) + PAYMENT_DUE_DAY - 1;
}

export function paidOnTime({ period, paid, paidAt }: Payment): Rubles {
  return paidAt !== null && isoToDays(paidAt) <= paymentDueDays(period) ? paid : 0;
}

export interface AggregateGroup {
  districtId: DictValue;
  responsibleId: DictValue;
}

export interface GroupSource {
  status: CardStatus;
  districtId: DictValue | null;
  responsibleId: DictValue;
}

export function aggregateGroupOf({
  status,
  districtId,
  responsibleId,
}: GroupSource): AggregateGroup | null {
  if (status !== 'active' && status !== 'review') return null;
  return { districtId: districtId ?? NO_DISTRICT, responsibleId };
}

export const sameGroup = (a: AggregateGroup | null, b: AggregateGroup | null): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.districtId === b.districtId &&
    a.responsibleId === b.responsibleId);

interface Cell {
  period: YearMonth;
  districtId: DictValue;
  responsibleId: DictValue;
  charged: number;
  paidOnTime: number;
}

const toKopecks = (rubles: Rubles): number => Math.round(rubles * 100);

export interface PeriodTotal {
  period: YearMonth;
  charged: Rubles;
  paidOnTime: Rubles;
}

export class AggregateCells {
  readonly periods: readonly YearMonth[];
  private readonly cells = new Map<string, Cell>();

  constructor(lastClosedIndex: number) {
    const first = lastClosedIndex - AGGREGATE_MONTHS + 1;
    this.periods = Array.from({ length: AGGREGATE_MONTHS }, (_, i) => periodFromIndex(first + i));
  }

  add(payments: readonly Payment[], group: AggregateGroup | null, sign: 1 | -1 = 1): void {
    const first = this.periods[0];
    const last = this.periods.at(-1);
    if (group === null || first === undefined || last === undefined) return;
    for (const payment of payments) {
      if (payment.period < first || payment.period > last) continue;
      const key = `${payment.period}|${group.districtId}|${group.responsibleId}`;
      let cell = this.cells.get(key);
      if (cell === undefined) {
        cell = { period: payment.period, ...group, charged: 0, paidOnTime: 0 };
        this.cells.set(key, cell);
      }
      cell.charged += sign * toKopecks(payment.toPay);
      cell.paidOnTime += sign * toKopecks(paidOnTime(payment));
    }
  }

  totals(match: (group: AggregateGroup) => boolean): PeriodTotal[] {
    const sums = new Map(this.periods.map((period) => [period, { charged: 0, paidOnTime: 0 }]));
    for (const cell of this.cells.values()) {
      const sum = sums.get(cell.period);
      if (sum === undefined || !match(cell)) continue;
      sum.charged += cell.charged;
      sum.paidOnTime += cell.paidOnTime;
    }
    return this.periods.map((period) => {
      const sum = sums.get(period) ?? { charged: 0, paidOnTime: 0 };
      return { period, charged: sum.charged / 100, paidOnTime: sum.paidOnTime / 100 };
    });
  }
}

export const PERIOD_OPTIONS: readonly PeriodMonths[] = [3, 6, 12];

export const DEFAULT_PERIOD: PeriodMonths = 12;

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  districtId: null,
  responsibleId: null,
  periodMonths: DEFAULT_PERIOD,
};

const isPeriod = (value: number): value is PeriodMonths =>
  (PERIOD_OPTIONS as readonly number[]).includes(value);

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
  const period = Number(params.period?.[0]);
  return {
    districtId: codeOf(params.district?.[0], dictionaries, 'district'),
    responsibleId: codeOf(params.responsible?.[0], dictionaries, 'responsible'),
    periodMonths: isPeriod(period) ? period : DEFAULT_PERIOD,
  };
}

export function toDashboardParams({
  districtId,
  responsibleId,
  periodMonths,
}: DashboardFilters): QueryParamsPatch {
  return {
    district: districtId,
    responsible: responsibleId,
    period: periodMonths === DEFAULT_PERIOD ? null : periodMonths,
  };
}

export const toDashboardQuery = ({
  districtId,
  responsibleId,
}: DashboardFilters): DashboardQuery => ({ districtId, responsibleId });

export const EXPIRING_WITHIN_DAYS = 30;

export const NO_CONTACT_DAYS = 90;

export const REVIEW_OVERDUE_DAYS = 14;

export function isContactOverdue(lastContactAt: IsoDate | null, todayIso: IsoDate): boolean {
  return lastContactAt === null || lastContactAt < daysToIso(isoToDays(todayIso) - NO_CONTACT_DAYS);
}

export const DEADLINE_SOON_DAYS = 7;

export function deadlineTone(date: IsoDate | null, today: IsoDate): DeadlineTone {
  if (date === null) return 'none';
  if (date < today) return 'overdue';
  return isoToDays(date) - isoToDays(today) <= DEADLINE_SOON_DAYS ? 'soon' : 'none';
}
