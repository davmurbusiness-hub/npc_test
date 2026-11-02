import type { DashboardData } from 'types/dashboard';

import { useDashboard } from '../../context';
import { ActionQueue } from '../ActionQueue';
import { ChannelsDonut } from '../ChannelsDonut';
import { DistrictBars } from '../DistrictBars';
import { ResponsibleLoadTable } from '../ResponsibleLoadTable';
import { Widget } from '../Widget';
import styles from './DashboardView.module.scss';

export interface WidgetsProps {
  data: DashboardData;
}

export function Widgets({ data }: WidgetsProps) {
  const { districtId, responsibleId } = useDashboard((state) => state.filters);

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
        title="Районы"
        question="Сколько граждан в каждом районе"
        note={
          districtId === null
            ? undefined
            : 'Показаны все районы: фильтр района не сужает сравнение, выбранный выделен.'
        }
        className={styles.districts}
      >
        <DistrictBars data={data.districts} selectedId={districtId} />
      </Widget>

      <Widget
        title="Каналы и доступность"
        question="Каким способом связываться и кому нужна помощь при приёме"
        className={styles.full}
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
