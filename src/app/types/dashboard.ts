import type {
  CitizenId,
  DictValue,
  IsoDate,
  IsoDateTime,
  Percent,
  Rubles,
  YearMonth,
} from './common';
import type {
  BenefitKind,
  ContactChannel,
  DeadlineTone,
  DebtAgeBucket,
  PeriodMonths,
  SpecialNeed,
} from './dictionaries';
import type { Drilldown } from './registry';

export interface DashboardQuery {
  districtId: DictValue | null;
  responsibleId: DictValue | null;
}

export type DashboardFilters = DashboardQuery & {
  periodMonths: PeriodMonths;
};

export interface KpiDebtors {
  count: number;
  amount: Rubles;
  link: Drilldown;
}

export interface KpiCollection {
  rate: Percent | null;
  previousRate: Percent | null;
  delta: number | null;
  month: YearMonth;
}

export interface KpiOnReview {
  count: number;
  overdueCount: number;
  link: Drilldown;
}

export interface KpiCount {
  count: number;
  link: Drilldown;
}

export interface DashboardKpi {
  debtors: KpiDebtors;
  collection: KpiCollection;
  onReview: KpiOnReview;
  expiring: KpiCount;
  debtorsNoContact: KpiCount;
  unreachable: KpiCount;
}

export interface CollectionMonth {
  period: YearMonth;
  charged: Rubles;
  paidOnTime: Rubles;
  rate: Percent | null;
}

export interface DebtAgeStat {
  bucket: DebtAgeBucket;
  citizens: number;
  amount: Rubles;
  link: Drilldown;
}

export type ActionQueueKind =
  | 'documentExpiring'
  | 'benefitExpiring'
  | 'powerOfAttorneyExpiring'
  | 'noConsent'
  | 'reviewOver14'
  | 'duplicatesToMerge'
  | 'deliveryErrors';

export interface ActionQueueItem {
  kind: ActionQueueKind;
  count: number;
  tone: DeadlineTone;
  link: Drilldown;
}

export interface TopDebtor {
  id: CitizenId;
  fullName: string;
  districtId: DictValue | null;
  debt: Rubles;
  overdueMonths: number;
  lastContactAt: IsoDate | null;
  responsibleId: DictValue;
}

export interface DistrictStat {
  districtId: DictValue;
  citizens: number;
  debtors: number;
  debtorShare: Percent;
  debtAmount: Rubles;
  link: Drilldown;
}

export interface DistrictsData {
  items: DistrictStat[];
  averageShare: Percent | null;
}

export interface BenefitKindStat {
  kind: BenefitKind;
  confirmed: number;
  onReview: number;
  expired: number;
  monthlyDiscount: Rubles;
  links: Record<'confirmed' | 'onReview' | 'expired', Drilldown>;
}

export type ResponsibleLoadMetric = 'cards' | 'onReview' | 'onReviewOver14' | 'debtorsNoContact';

export interface ResponsibleLoad {
  responsibleId: DictValue;
  cards: number;
  onReview: number;
  onReviewOver14: number;
  debtorsNoContact: number;
  links: Record<ResponsibleLoadMetric, Drilldown>;
}

export interface ChannelsData {
  byChannel: { channel: ContactChannel; citizens: number; link: Drilldown }[];
  noConsent: KpiCount;
  specialNeeds: { need: Exclude<SpecialNeed, 'none'>; citizens: number; link: Drilldown }[];
}

export interface DashboardData {
  generatedAt: IsoDateTime;
  query: DashboardQuery;
  kpi: DashboardKpi;
  collection: CollectionMonth[];
  debtAge: DebtAgeStat[];
  actionQueue: ActionQueueItem[];
  topDebtors: TopDebtor[];
  districts: DistrictsData;
  benefits: BenefitKindStat[];
  load: ResponsibleLoad[];
  channels: ChannelsData;
}
