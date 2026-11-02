import { labelOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import type { DictValue } from 'types/common';
import type { ResponsibleLoad, ResponsibleLoadMetric } from 'types/dashboard';

import { CountLink } from '../CountLink';
import styles from './ResponsibleLoadTable.module.scss';

export interface ResponsibleLoadTableProps {
  rows: readonly ResponsibleLoad[];
  selectedId: DictValue | null;
  className?: string;
}

const METRIC_HEADERS: Readonly<Record<ResponsibleLoadMetric, string>> = {
  cards: 'Карточек',
  onReview: 'На проверке',
  onReviewOver14: 'На проверке > 14 дн',
  debtorsNoContact: 'Должники без контакта',
};

function metricColumn(metric: ResponsibleLoadMetric): DataTableColumn<ResponsibleLoad> {
  return {
    key: metric,
    header: METRIC_HEADERS[metric],
    align: 'end',
    render: (row) => (
      <CountLink
        count={row[metric]}
        link={row.links[metric]}
        label={`${labelOf('responsible', row.responsibleId)}, ${METRIC_HEADERS[metric]}`}
        tone={metric === 'onReviewOver14' && row[metric] > 0 ? 'negative' : 'default'}
      />
    ),
  };
}

export function ResponsibleLoadTable({ rows, selectedId, className }: ResponsibleLoadTableProps) {
  const columns: readonly DataTableColumn<ResponsibleLoad>[] = [
    {
      key: 'responsible',
      header: 'Ответственный',
      render: (row) => (
        <span className={styles.name}>
          {labelOf('responsible', row.responsibleId)}
          {row.responsibleId === selectedId && <Badge tone="info">Выбран</Badge>}
        </span>
      ),
    },
    metricColumn('cards'),
    metricColumn('onReview'),
    metricColumn('onReviewOver14'),
    metricColumn('debtorsNoContact'),
  ];

  return (
    <DataTable
      caption="Нагрузка по ответственным"
      captionVisibility="hidden"
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.responsibleId}
      className={className}
    />
  );
}
