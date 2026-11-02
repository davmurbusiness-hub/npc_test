import cn from 'classnames';
import { useNavigate } from 'react-router';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { labelOf } from 'api/dictionaries';
import type { ChannelsData } from 'types/dashboard';
import { formatCount, formatPercent } from 'utils/format';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import { CountLink } from '../CountLink';
import styles from './ChannelsDonut.module.scss';

import type { TooltipContentProps } from 'recharts';

export interface ChannelsDonutProps {
  data: ChannelsData;
  className?: string;
}

const SERIES = [
  'var(--chart-series-1)',
  'var(--chart-series-2)',
  'var(--chart-series-3)',
  'var(--chart-series-4)',
  'var(--chart-series-5)',
] as const;

interface Slice {
  key: string;
  label: string;
  citizens: number;
  share: number | null;
  href: string;
}

function SliceTooltip({ active, payload }: TooltipContentProps) {
  const slice: unknown = payload[0]?.payload;
  if (!active || typeof slice !== 'object' || slice === null || !('label' in slice)) return null;
  const { label, citizens, share } = slice as Slice;
  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      <span>{`${formatCount(citizens)} · ${formatPercent(share)}`}</span>
    </div>
  );
}

export function ChannelsDonut({ data, className }: ChannelsDonutProps) {
  const navigate = useNavigate();
  const total = data.byChannel.reduce((sum, item) => sum + item.citizens, 0);
  const slices: Slice[] = data.byChannel.map((item) => ({
    key: item.channel,
    label: labelOf('contactChannel', item.channel),
    citizens: item.citizens,
    share: total === 0 ? null : (item.citizens / total) * 100,
    href: `${PATHS.registry}${drilldownSearch(item.link)}`,
  }));

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.channels}>
        <div className={styles.plot} aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="citizens"
                nameKey="label"
                innerRadius="58%"
                outerRadius="92%"
                startAngle={90}
                endAngle={-270}
                stroke="var(--color-bg-surface)"
                strokeWidth={2}
                isAnimationActive={false}
                onClick={(_, index) => {
                  const slice = slices[index];
                  if (slice && slice.citizens > 0) void navigate(slice.href);
                }}
                className={styles.pie}
              >
                {slices.map((slice, index) => (
                  <Cell key={slice.key} fill={SERIES[index % SERIES.length]} />
                ))}
              </Pie>
              <Tooltip content={SliceTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className={styles.legend} aria-label="Предпочтительный канал связи">
          {data.byChannel.map((item, index) => {
            const slice = slices[index];
            return (
              <li key={item.channel} className={styles.legendItem}>
                <span
                  className={cn(styles.swatch, styles[`series${(index % SERIES.length) + 1}`])}
                  aria-hidden="true"
                />
                <span className={styles.legendLabel}>{slice?.label}</span>
                <CountLink
                  count={item.citizens}
                  link={item.link}
                  label={`Канал связи «${slice?.label ?? ''}»`}
                />
                <span className={styles.share}>{formatPercent(slice?.share ?? null)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <dl className={styles.access}>
        <div className={styles.accessRow}>
          <dt>Без действующего согласия ПДн</dt>
          <dd>
            <CountLink
              count={data.noConsent.count}
              link={data.noConsent.link}
              label="Без действующего согласия ПДн"
            />
          </dd>
        </div>
        {data.specialNeeds.map((item) => {
          const label = labelOf('specialNeed', item.need);
          return (
            <div key={item.need} className={styles.accessRow}>
              <dt>{label}</dt>
              <dd>
                <CountLink count={item.citizens} link={item.link} label={label} />
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
