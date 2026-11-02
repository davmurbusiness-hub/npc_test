import cn from 'classnames';

import { StatTile } from 'components/StatTile';
import { Text } from 'components/Text';
import type { DashboardKpi } from 'types/dashboard';
import type { Drilldown } from 'types/registry';
import { REVIEW_OVERDUE_DAYS } from 'utils/dashboard';
import { formatCount } from 'utils/format';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import styles from './KpiRow.module.scss';

export interface KpiRowProps {
  kpi: DashboardKpi;
  className?: string;
}

const hrefOf = (count: number, link: Drilldown): string | undefined =>
  count > 0 ? `${PATHS.registry}${drilldownSearch(link)}` : undefined;

export function KpiRow({ kpi, className }: KpiRowProps) {
  const { onReview, expiring } = kpi;

  return (
    <div className={cn(styles.root, className)}>
      <StatTile
        label="На проверке"
        hint={
          onReview.overdueCount > 0 ? (
            <Text as="span" size="inherit" color="negative" weight="medium">
              {`из них ${formatCount(onReview.overdueCount)} дольше ${REVIEW_OVERDUE_DAYS} дн`}
            </Text>
          ) : (
            `дольше ${REVIEW_OVERDUE_DAYS} дн — нет`
          )
        }
        to={hrefOf(onReview.count, onReview.link)}
      >
        {formatCount(onReview.count)}
      </StatTile>
      <StatTile
        label="Истекает ≤ 30 дней"
        hint="документ, согласие"
        to={hrefOf(expiring.count, expiring.link)}
      >
        {formatCount(expiring.count)}
      </StatTile>
    </div>
  );
}
