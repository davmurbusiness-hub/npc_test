import cn from 'classnames';

import { StatTile } from 'components/StatTile';
import type { StatTileDelta } from 'components/StatTile';
import { Text } from 'components/Text';
import type { YearMonth } from 'types/common';
import type { DashboardKpi, KpiCollection } from 'types/dashboard';
import type { Drilldown } from 'types/registry';
import { NO_CONTACT_DAYS, REVIEW_OVERDUE_DAYS } from 'utils/dashboard';
import {
  formatCount,
  formatMoney,
  formatPercent,
  formatPoints,
  formatMonth,
  formatMonthDative,
} from 'utils/format';
import { periodFromIndex, periodIndex } from 'utils/isoDate';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import styles from './KpiRow.module.scss';

export interface KpiRowProps {
  kpi: DashboardKpi;
  onCollectionClick: () => void;
  className?: string;
}

const hrefOf = (count: number, link: Drilldown): string | undefined =>
  count > 0 ? `${PATHS.registry}${drilldownSearch(link)}` : undefined;

const previousPeriod = (period: YearMonth): YearMonth => periodFromIndex(periodIndex(period) - 1);

function collectionDelta({ delta, month }: KpiCollection): StatTileDelta | undefined {
  if (delta === null) return undefined;
  return {
    text: `${formatPoints(delta)} к ${formatMonthDative(previousPeriod(month))}`,
    trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
    tone: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
  };
}

export function KpiRow({ kpi, onCollectionClick, className }: KpiRowProps) {
  const { debtors, collection, onReview, expiring, debtorsNoContact, unreachable } = kpi;
  const collectionLabel =
    collection.month === ''
      ? 'Собираемость'
      : `Собираемость за ${formatMonth(collection.month, 'name')}`;

  return (
    <div className={cn(styles.root, className)}>
      <StatTile
        label="Должники"
        hint={`долг ${formatMoney(debtors.amount, true)}`}
        to={hrefOf(debtors.count, debtors.link)}
      >
        {formatCount(debtors.count)}
      </StatTile>
      <StatTile
        label={collectionLabel}
        delta={collectionDelta(collection)}
        hint="оплачено в срок к начисленному"
        onClick={onCollectionClick}
      >
        {formatPercent(collection.rate)}
      </StatTile>
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
        hint="документ, льгота, доверенность, согласие"
        to={hrefOf(expiring.count, expiring.link)}
      >
        {formatCount(expiring.count)}
      </StatTile>
      <StatTile
        label="Должники без контакта"
        hint={`контакт больше ${NO_CONTACT_DAYS} дн назад`}
        to={hrefOf(debtorsNoContact.count, debtorsNoContact.link)}
      >
        {formatCount(debtorsNoContact.count)}
      </StatTile>
      <StatTile
        label="Недоступны для уведомления"
        hint="ошибка доставки или нет контактов"
        to={hrefOf(unreachable.count, unreachable.link)}
      >
        {formatCount(unreachable.count)}
      </StatTile>
    </div>
  );
}
