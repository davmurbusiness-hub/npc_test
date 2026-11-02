import type { IsoDate, IsoDateTime } from 'types/common';
import type { DashboardData, DashboardQuery } from 'types/dashboard';
import type { CitizenIndex } from 'types/registry';

import { ActionQueueCollector } from './actionQueue';
import { ChannelsCollector } from './channels';
import { DashboardContext } from './counter';
import { DistrictsCollector } from './districts';
import { KpiCollector } from './kpi';
import { LoadCollector } from './load';

import type { Collector } from './counter';

const codeOf = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export function buildDashboard(
  rows: CitizenIndex,
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
  const actionQueue = new ActionQueueCollector(ctx);
  const districts = new DistrictsCollector(ctx);
  const load = new LoadCollector(ctx);
  const channels = new ChannelsCollector(ctx);

  const collectors: Collector<unknown>[] = [kpi, actionQueue, districts, load, channels];
  for (const row of rows) {
    for (const collector of collectors) collector.add(row);
  }

  return {
    generatedAt,
    query,
    kpi: kpi.result(),
    actionQueue: actionQueue.result(),
    districts: districts.result(),
    load: load.result(),
    channels: channels.result(),
  };
}
