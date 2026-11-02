import cn from 'classnames';
import { useRef } from 'react';

import { Button } from 'components/Button';
import { EmptyState } from 'components/EmptyState';
import { PageHeader } from 'components/PageHeader';
import { Skeleton } from 'components/Skeleton';
import { Text } from 'components/Text';
import { selectRefreshing } from 'stores/LocalStore/DashboardStore';

import { useDashboard, useDashboardStore } from '../../context';
import { FilterBar } from '../FilterBar';
import { KpiRow } from '../KpiRow';
import styles from './DashboardView.module.scss';
import { Widgets } from './Widgets';

function DashboardSkeleton() {
  return (
    <div className={styles.content} aria-hidden="true">
      <div className={styles.kpiSkeleton}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} shape="block" height="md" />
        ))}
      </div>
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} shape="block" height="lg" className={styles.skeletonWidget} />
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const store = useDashboardStore();
  const load = useDashboard((state) => state.load);
  const refreshing = useDashboard(selectRefreshing);
  const collectionRef = useRef<HTMLElement>(null);

  const showCollection = () => {
    const target = collectionRef.current;
    if (target === null) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  };

  let content;
  if (load.data === null) {
    content =
      load.status === 'error' ? (
        <EmptyState
          title="Не удалось загрузить показатели"
          description={load.message}
          action={<Button onClick={() => store.retry()}>Повторить</Button>}
        />
      ) : (
        <DashboardSkeleton />
      );
  } else {
    content = (
      <div aria-busy={refreshing} className={cn(styles.content, refreshing && styles.refreshing)}>
        {load.status === 'error' && (
          <div role="alert" className={styles.alert}>
            <Text size="sm">{`Показатели не обновились: ${load.message}`}</Text>
            <Button size="sm" onClick={() => store.retry()}>
              Повторить
            </Button>
          </div>
        )}
        <KpiRow kpi={load.data.kpi} onCollectionClick={showCollection} />
        <Widgets data={load.data} collectionRef={collectionRef} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard"
        description="Показатели по гражданам на сегодня"
        actions={<FilterBar />}
      />
      {content}
    </div>
  );
}
