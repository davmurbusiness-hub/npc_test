import { Link } from 'react-router';

import { labelOf } from 'api/dictionaries';
import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import { Text } from 'components/Text';
import type { IsoDate } from 'types/common';
import type { TopDebtor } from 'types/dashboard';
import { isContactOverdue } from 'utils/dashboard';
import { formatIsoDate, formatMoney } from 'utils/format';

import { citizenPath } from 'config/paths';

import styles from './TopDebtorsTable.module.scss';

export interface TopDebtorsTableProps {
  rows: readonly TopDebtor[];
  today: IsoDate;
  className?: string;
}

const formatOverdue = (months: number): string => (months < 1 ? 'до 1 мес' : `${months} мес`);

function LastContact({ date, today }: { date: IsoDate | null; today: IsoDate }) {
  const overdue = isContactOverdue(date, today);
  return (
    <Text as="span" size="inherit" color={overdue ? 'negative' : 'inherit'}>
      {date === null ? 'нет контактов' : formatIsoDate(date)}
    </Text>
  );
}

export function TopDebtorsTable({ rows, today, className }: TopDebtorsTableProps) {
  const columns: readonly DataTableColumn<TopDebtor>[] = [
    {
      key: 'fullName',
      header: 'ФИО',
      render: (row) => (
        <Link to={citizenPath(row.id)} className={styles.name}>
          {row.fullName}
        </Link>
      ),
    },
    {
      key: 'district',
      header: 'Район',
      render: (row) => (row.districtId === null ? '—' : labelOf('district', row.districtId)),
    },
    { key: 'debt', header: 'Долг', align: 'end', render: (row) => formatMoney(row.debt) },
    {
      key: 'overdue',
      header: 'Просрочка',
      align: 'end',
      render: (row) => formatOverdue(row.overdueMonths),
    },
    {
      key: 'lastContact',
      header: 'Последний контакт',
      render: (row) => <LastContact date={row.lastContactAt} today={today} />,
    },
    {
      key: 'responsible',
      header: 'Ответственный',
      render: (row) => labelOf('responsible', row.responsibleId),
    },
  ];

  return (
    <DataTable
      caption="Топ-10 должников"
      captionVisibility="hidden"
      columns={columns}
      rows={rows}
      getRowKey={(row) => String(row.id)}
      className={className}
    />
  );
}
