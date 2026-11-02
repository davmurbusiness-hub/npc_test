import { DICTIONARIES } from 'data/dictionaries';
import type { ChannelsData } from 'types/dashboard';
import type { ContactChannel, SpecialNeed } from 'types/dictionaries';
import type { CitizenRow } from 'types/registry';

import type { Collector, Counter, DashboardContext } from './counter';

type Need = Exclude<SpecialNeed, 'none'>;

export class ChannelsCollector implements Collector<ChannelsData> {
  private readonly channels: ReadonlyMap<ContactChannel, Counter>;
  private readonly noConsent: Counter;
  private readonly needs: ReadonlyMap<Need, Counter>;

  constructor(ctx: DashboardContext) {
    this.channels = new Map(
      DICTIONARIES.contactChannel.map(({ value }) => [
        value as ContactChannel,
        ctx.counter({ contactChannels: [value] }),
      ])
    );
    this.noConsent = ctx.counter({ noValidConsent: true });
    this.needs = new Map(
      DICTIONARIES.specialNeed
        .filter(({ value }) => value !== 'none')
        .map(({ value }) => [value as Need, ctx.counter({ specialNeeds: [value] })])
    );
  }

  add(row: CitizenRow): void {
    this.channels.get(row.contactChannel)?.add(row);
    this.noConsent.add(row);
    for (const need of new Set(row.specialNeeds)) {
      if (need !== 'none') this.needs.get(need)?.add(row);
    }
  }

  result(): ChannelsData {
    return {
      byChannel: [...this.channels].map(([channel, counter]) => ({
        channel,
        citizens: counter.count,
        link: counter.link,
      })),
      noConsent: { count: this.noConsent.count, link: this.noConsent.link },
      specialNeeds: [...this.needs].map(([need, counter]) => ({
        need,
        citizens: counter.count,
        link: counter.link,
      })),
    };
  }
}
