import { useState } from 'react';

import { EmptyState } from 'components/EmptyState';
import { SegmentedControl } from 'components/SegmentedControl';
import { selectCollection } from 'stores/LocalStore/DashboardStore';
import type { DashboardData } from 'types/dashboard';
import type { PeriodMonths } from 'types/dictionaries';
import { PERIOD_OPTIONS } from 'utils/dashboard';

import { useDashboard, useDashboardStore } from '../../context';
import { ActionQueue } from '../ActionQueue';
import { BenefitStack } from '../BenefitStack';
import { ChannelsDonut } from '../ChannelsDonut';
import { CollectionChart } from '../CollectionChart';
import { DebtAgeBars } from '../DebtAgeBars';
import { DistrictBars } from '../DistrictBars';
import { ResponsibleLoadTable } from '../ResponsibleLoadTable';
import { TopDebtorsTable } from '../TopDebtorsTable';
import { Widget } from '../Widget';
import styles from './DashboardView.module.scss';

import type { CollectionView } from '../CollectionChart';
import type { RefObject } from 'react';

export interface WidgetsProps {
  data: DashboardData;
  collectionRef: RefObject<HTMLElement | null>;
}

const PERIODS = PERIOD_OPTIONS.map((months) => ({ value: String(months), label: `${months} мес` }));

const VIEWS: readonly { value: CollectionView; label: string }[] = [
  { value: 'chart', label: 'График' },
  { value: 'table', label: 'Таблица' },
];

const toPeriod = (value: string): PeriodMonths =>
  PERIOD_OPTIONS.find((months) => String(months) === value) ?? 12;

export function Widgets({ data, collectionRef }: WidgetsProps) {
  const store = useDashboardStore();
  const { districtId, responsibleId, periodMonths } = useDashboard((state) => state.filters);
  const months = useDashboard(selectCollection);
  const [collectionView, setCollectionView] = useState<CollectionView>('chart');

  return (
    <div className={styles.grid}>
      <Widget
        title="Требуют действия"
        question="Очередь работы на сегодня"
        className={styles.queue}
      >
        <ActionQueue items={data.actionQueue} />
      </Widget>

      <Widget
        ref={collectionRef}
        title="Собираемость по месяцам"
        question="Растёт или падает оплата, в какие месяцы провалы"
        note="Оплачено в срок — до 10-го числа следующего месяца."
        actions={
          <>
            <SegmentedControl
              label="Период"
              options={PERIODS}
              value={String(periodMonths)}
              onChange={(value) => store.setPeriod(toPeriod(value))}
            />
            <SegmentedControl
              label="Вид"
              options={VIEWS}
              value={collectionView}
              onChange={setCollectionView}
            />
          </>
        }
        className={styles.collection}
      >
        <CollectionChart months={months} view={collectionView} />
      </Widget>

      <Widget
        title="Долг по давности"
        question="Насколько «старый» долг, с чего начинать взыскание"
        className={styles.debtAge}
      >
        <DebtAgeBars items={data.debtAge} />
      </Widget>

      <Widget
        title="Районы"
        question="Где проблемные районы: доля должников и сумма долга"
        note={
          districtId === null
            ? undefined
            : 'Показаны все районы: фильтр района не сужает сравнение, выбранный выделен.'
        }
        className={styles.districts}
      >
        <DistrictBars data={data.districts} selectedId={districtId} />
      </Widget>

      <Widget title="Топ-10 должников" question="Кому звонить первым" className={styles.full}>
        {data.topDebtors.length === 0 ? (
          <EmptyState
            title="Должников нет"
            description="В выбранной выборке долга ни у кого нет."
          />
        ) : (
          <TopDebtorsTable rows={data.topDebtors} today={store.today} />
        )}
      </Widget>

      <Widget
        title="Льготы"
        question="Сколько получателей, во что обходятся, где просрочено подтверждение"
        className={styles.benefits}
      >
        <BenefitStack items={data.benefits} />
      </Widget>

      <Widget
        title="Каналы и доступность"
        question="Каким способом связываться и кому нужна помощь при приёме"
        className={styles.channels}
      >
        <ChannelsDonut data={data.channels} />
      </Widget>

      <Widget
        title="Нагрузка по ответственным"
        question="Как загружены сотрудники, где просрочки"
        note={
          responsibleId === null
            ? undefined
            : 'Показаны все ответственные: фильтр ответственного таблицу не сужает.'
        }
        className={styles.full}
      >
        <ResponsibleLoadTable rows={data.load} selectedId={responsibleId} />
      </Widget>
    </div>
  );
}
