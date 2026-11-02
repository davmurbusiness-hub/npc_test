import { useState } from 'react';

import { optionsOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { NumberText } from 'components/NumberText';
import { Text } from 'components/Text';
import type { CitizenNotification, Payment } from 'types/entities';
import { formatIsoDate, formatIsoDateTime, formatRubles, round2 } from 'utils/format';
import { DELIVERY_TONE, PAYMENT_TONE, labelIn } from 'utils/ui';

import styles from './related.module.scss';
import { useCitizen } from '../../context';

const NO_PAYMENTS: readonly Payment[] = [];
const NO_NOTIFICATIONS: readonly CitizenNotification[] = [];

const PAYMENTS_PAGE = 100;

const PERIOD_FORMAT = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

function periodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  return PERIOD_FORMAT.format(new Date(year ?? 0, (month ?? 1) - 1, 1));
}

export function PaymentsSection() {
  const payments = useCitizen((state) => state.card?.related.payments ?? NO_PAYMENTS);
  const objects = useCitizen((state) => state.card?.related.objects);
  const [limit, setLimit] = useState(PAYMENTS_PAGE);

  const sorted = [...payments].sort(
    (a, b) => b.period.localeCompare(a.period) || a.objectId.localeCompare(b.objectId)
  );
  const debt = round2(payments.reduce((sum, payment) => sum + payment.debt, 0));
  const accountOf = (objectId: string) =>
    objects?.find((object) => object.id === objectId)?.accountNumber ?? objectId;

  const columns: DataTableColumn<Payment>[] = [
    { key: 'period', header: 'Период', render: (row) => periodLabel(row.period) },
    { key: 'account', header: 'ЛС', render: (row) => accountOf(row.objectId) },
    {
      key: 'charged',
      header: 'Начислено',
      align: 'end',
      render: (row) => formatRubles(row.charged),
    },
    {
      key: 'discount',
      header: 'Скидка',
      align: 'end',
      render: (row) => formatRubles(row.discount),
    },
    { key: 'penalty', header: 'Пеня', align: 'end', render: (row) => formatRubles(row.penalty) },
    { key: 'paid', header: 'Оплачено', align: 'end', render: (row) => formatRubles(row.paid) },
    {
      key: 'paidAt',
      header: 'Дата оплаты',
      render: (row) => (row.paidAt === null ? null : formatIsoDate(row.paidAt)),
    },
    {
      key: 'method',
      header: 'Способ',
      render: (row) => labelIn(optionsOf('paymentMethod'), row.method),
    },
    { key: 'document', header: '№ документа', render: (row) => row.documentNumber },
    {
      key: 'status',
      header: 'Статус',
      render: (row) => (
        <Badge tone={PAYMENT_TONE[row.status]}>
          {labelIn(optionsOf('paymentStatus'), row.status)}
        </Badge>
      ),
    },
    { key: 'debt', header: 'Долг', align: 'end', render: (row) => formatRubles(row.debt) },
  ];

  if (payments.length === 0) return <EmptyState title="Платежей нет" />;

  return (
    <div className={styles.root}>
      <div className={styles.footer}>
        <Text as="span" size="sm" color="secondary">
          Начислений: {payments.length}, новые сверху. Только чтение.
        </Text>
        <Text as="span" size="sm">
          Задолженность:{' '}
          <NumberText value={debt} format="money" tone={debt > 0 ? 'negative' : undefined} />
        </Text>
      </div>
      <DataTable
        caption="Платежи по лицевым счетам"
        captionVisibility="hidden"
        columns={columns}
        rows={sorted.slice(0, limit)}
        getRowKey={(row) => row.id}
      />
      {sorted.length > limit && (
        <Button onClick={() => setLimit(limit + PAYMENTS_PAGE)}>
          Показать ещё {Math.min(PAYMENTS_PAGE, sorted.length - limit)}
        </Button>
      )}
    </div>
  );
}

const NOTIFICATION_COLUMNS: readonly DataTableColumn<CitizenNotification>[] = [
  { key: 'sentAt', header: 'Дата', render: (row) => formatIsoDateTime(row.sentAt) },
  {
    key: 'channel',
    header: 'Канал',
    render: (row) => labelIn(optionsOf('notificationChannel'), row.channel),
  },
  { key: 'type', header: 'Тип', render: (row) => labelIn(optionsOf('notificationType'), row.type) },
  {
    key: 'status',
    header: 'Доставка',
    render: (row) => (
      <Badge tone={DELIVERY_TONE[row.deliveryStatus]}>
        {labelIn(optionsOf('deliveryStatus'), row.deliveryStatus)}
      </Badge>
    ),
  },
  {
    key: 'error',
    header: 'Причина ошибки',
    render: (row) => labelIn(optionsOf('deliveryError'), row.errorReason),
  },
];

export function NotificationsSection() {
  const notifications = useCitizen(
    (state) => state.card?.related.notifications ?? NO_NOTIFICATIONS
  );
  const sorted = [...notifications].sort((a, b) => b.sentAt.localeCompare(a.sentAt));

  if (notifications.length === 0) return <EmptyState title="Уведомлений нет" />;

  return (
    <div className={styles.root}>
      <Text as="span" size="sm" color="secondary">
        Отправлено: {notifications.length}, новые сверху. Только чтение.
      </Text>
      <DataTable
        caption="Уведомления гражданину"
        captionVisibility="hidden"
        columns={NOTIFICATION_COLUMNS}
        rows={sorted}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}
