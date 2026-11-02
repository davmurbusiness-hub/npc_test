import type { DictValue, IsoDateTime } from './common';
import type { ContactChannel, DeadlineTone, SpecialNeed } from './dictionaries';
import type { Drilldown } from './registry';

export interface DashboardQuery {
  districtId: DictValue | null;
  responsibleId: DictValue | null;
}

export type DashboardFilters = DashboardQuery;

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
  onReview: KpiOnReview;
  expiring: KpiCount;
}

export type ActionQueueKind =
  'documentExpiring' | 'noConsent' | 'reviewOver14' | 'duplicatesToMerge';

export interface ActionQueueItem {
  kind: ActionQueueKind;
  count: number;
  tone: DeadlineTone;
  link: Drilldown;
}

export interface DistrictStat {
  districtId: DictValue;
  citizens: number;
  link: Drilldown;
}

export interface DistrictsData {
  items: DistrictStat[];
  average: number | null;
}

export type ResponsibleLoadMetric = 'cards' | 'onReview' | 'onReviewOver14';

export interface ResponsibleLoad {
  responsibleId: DictValue;
  cards: number;
  onReview: number;
  onReviewOver14: number;
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
  actionQueue: ActionQueueItem[];
  districts: DistrictsData;
  load: ResponsibleLoad[];
  channels: ChannelsData;
}
