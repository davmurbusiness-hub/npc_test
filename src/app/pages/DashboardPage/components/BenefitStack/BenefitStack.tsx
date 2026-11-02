import cn from 'classnames';
import { Link } from 'react-router';

import { labelOf } from 'api/dictionaries';
import type { BenefitKindStat } from 'types/dashboard';
import { formatCount, formatMoney } from 'utils/format';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import { CountLink } from '../CountLink';
import styles from './BenefitStack.module.scss';

import type { CSSProperties } from 'react';

export interface BenefitStackProps {
  items: readonly BenefitKindStat[];
  className?: string;
}

type Segment = keyof BenefitKindStat['links'];

const SEGMENTS: readonly { key: Segment; label: string }[] = [
  { key: 'confirmed', label: 'Подтверждена' },
  { key: 'onReview', label: 'На проверке' },
  { key: 'expired', label: 'Истекла' },
];

type SegmentStyle = CSSProperties & { '--segment-share': string };

const segmentStyle = (share: string): SegmentStyle => ({ '--segment-share': share });

export function BenefitStack({ items, className }: BenefitStackProps) {
  const max = Math.max(1, ...items.map((item) => item.confirmed + item.onReview + item.expired));

  return (
    <div className={cn(styles.root, className)}>
      <ul className={styles.legend} aria-label="Статус льготы">
        {SEGMENTS.map((segment) => (
          <li key={segment.key} className={styles.legendItem}>
            <span className={cn(styles.swatch, styles[segment.key])} aria-hidden="true" />
            {segment.label}
          </li>
        ))}
      </ul>
      <ul className={styles.rows}>
        {items.map((item) => {
          const kind = labelOf('benefitKind', item.kind);
          return (
            <li key={item.kind} className={styles.row}>
              <div className={styles.head}>
                <span className={styles.kind}>{kind}</span>
                <span className={styles.discount}>
                  {`скидки ${formatMoney(item.monthlyDiscount, true)} в мес`}
                </span>
              </div>
              <div className={styles.bar} aria-hidden="true">
                {SEGMENTS.map(({ key }) =>
                  item[key] === 0 ? null : (
                    <Link
                      key={key}
                      to={`${PATHS.registry}${drilldownSearch(item.links[key])}`}
                      tabIndex={-1}
                      title={`${kind}, ${SEGMENTS.find((s) => s.key === key)?.label.toLowerCase()}: ${formatCount(item[key])}`}
                      className={cn(styles.segment, styles[key])}
                      style={segmentStyle(`${(item[key] / max) * 100}%`)}
                    />
                  )
                )}
              </div>
              <div className={styles.counts}>
                {SEGMENTS.map((segment) => (
                  <span key={segment.key} className={styles.count}>
                    <span className={cn(styles.swatch, styles[segment.key])} aria-hidden="true" />
                    <CountLink
                      count={item[segment.key]}
                      link={item.links[segment.key]}
                      label={`${kind}, ${segment.label.toLowerCase()}`}
                    />
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
