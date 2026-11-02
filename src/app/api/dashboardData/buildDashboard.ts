import type { IsoDate, IsoDateTime } from 'types/common';
import type { DashboardData, DashboardQuery } from 'types/dashboard';
import type { CitizenIndex } from 'types/registry';
import type { AggregateCells } from 'utils/dashboard';

import { ActionQueueCollector } from './actionQueue';
import { BenefitsCollector } from './benefits';
import { ChannelsCollector } from './channels';
import { collectionMonths } from './collection';
import { DashboardContext } from './counter';
import { DebtAgeCollector } from './debtAge';
import { DistrictsCollector } from './districts';
import { KpiCollector, collectionKpi } from './kpi';
import { LoadCollector } from './load';
import { TopDebtorsCollector } from './topDebtors';

import type { Collector } from './counter';

const codeOf = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export function buildDashboard(
  rows: CitizenIndex,
  aggregates: AggregateCells,
  todayIso: IsoDate,
  raw: DashboardQuery,
  generatedAt: IsoDateTime
): DashboardData {
  const query: DashboardQuery = {
    districtId: codeOf(raw.districtId),
    responsibleId: codeOf(raw.responsibleId),
  };
  const ctx = new DashboardContext(query, todayIso);
  const kpi = new KpiCollector(ctx);
  const debtAge = new DebtAgeCollector(ctx);
  const actionQueue = new ActionQueueCollector(ctx);
  const topDebtors = new TopDebtorsCollector(ctx);
  const districts = new DistrictsCollector(ctx);
  const benefits = new BenefitsCollector(ctx);
  const load = new LoadCollector(ctx);
  const channels = new ChannelsCollector(ctx);

  const collectors: Collector<unknown>[] = [
    kpi,
    debtAge,
    actionQueue,
    topDebtors,
    districts,
    benefits,
    load,
    channels,
  ];
  for (const row of rows) {
    for (const collector of collectors) collector.add(row);
  }

  const collection = collectionMonths(aggregates, query);
  return {
    generatedAt,
    query,
    kpi: { ...kpi.result(), collection: collectionKpi(collection) },
    collection,
    debtAge: debtAge.result(),
    actionQueue: actionQueue.result(),
    topDebtors: topDebtors.result(),
    districts: districts.result(),
    benefits: benefits.result(),
    load: load.result(),
    channels: channels.result(),
  };
}
