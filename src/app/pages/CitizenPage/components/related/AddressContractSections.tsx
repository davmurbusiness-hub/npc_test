import { optionsOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import type { DataTableColumn } from 'components/DataTable';
import type { DraftRow } from 'types/form';
import { addressText } from 'utils/citizen';
import { formatIsoDate, periodText } from 'utils/format';
import { formatMasked } from 'utils/masks';
import { CONTRACT_TONE, labelIn } from 'utils/ui';

import { FieldGrid, fieldsOf, useFormScope } from '../fields';
import { RelatedSection } from './RelatedSection';

const A = fieldsOf<DraftRow<'addresses'>>();

const ADDRESS_COLUMNS: readonly DataTableColumn<DraftRow<'addresses'>>[] = [
  { key: 'type', header: 'Тип', render: (row) => labelIn(optionsOf('addressType'), row.type) },
  { key: 'primary', header: 'Основной', render: (row) => (row.isPrimary ? 'да' : 'нет') },
  {
    key: 'address',
    header: 'Адрес',
    render: (row) => (
      <>
        {labelIn(optionsOf('region'), row.region)}
        {row.district !== null && `, ${row.district}`}
        <br />
        {addressText(row)}
      </>
    ),
  },
  {
    key: 'postalCode',
    header: 'Индекс',
    render: (row) => formatMasked('postalCode', row.postalCode),
  },
  { key: 'period', header: 'Действует', render: (row) => periodText(row.validFrom, row.validTo) },
];

export function AddressesSection() {
  return (
    <RelatedSection
      table="addresses"
      caption="Адреса гражданина"
      columns={ADDRESS_COLUMNS}
      emptyText="Адресов нет"
      addLabel="Добавить адрес"
      rowLabel={(row) => addressText(row) || 'адрес'}
      modalTitle={{ add: 'Новый адрес', edit: 'Адрес' }}
      form={
        <>
          <FieldGrid title="Назначение">
            <A.Select name="type" label="Тип адреса" options={optionsOf('addressType')} />
            <A.Switch name="isPrimary" label="Основной адрес" />
          </FieldGrid>
          <FieldGrid title="Адрес">
            <A.SearchSelect name="region" label="Регион" options={optionsOf('region')} />
            <A.Text name="district" label="Район / МО" />
            <A.Text name="city" label="Населённый пункт" />
            <A.Text name="street" label="Улица" />
            <A.Text name="house" label="Дом" />
            <A.Text name="building" label="Корпус" />
            <A.Text name="apartment" label="Квартира" />
            <A.Masked name="postalCode" label="Индекс" mask="postalCode" />
          </FieldGrid>
          <FieldGrid title="Срок">
            <A.Date name="validFrom" label="Действует с" />
            <A.Date name="validTo" label="Действует по" />
          </FieldGrid>
        </>
      }
    />
  );
}

const C = fieldsOf<DraftRow<'contracts'>>();

function ContractForm() {
  const { values } = useFormScope();
  return (
    <>
      <FieldGrid title="Договор">
        <C.Text name="contractNumber" label="№ договора" />
        <C.Date name="concludedAt" label="Дата заключения" />
        <C.Date name="validUntil" label="Срок действия" />
        <C.Select name="status" label="Статус" options={optionsOf('contractStatus')} />
        <C.Select
          name="conclusionMethod"
          label="Способ заключения"
          options={optionsOf('conclusionMethod')}
        />
      </FieldGrid>
      {values.status === 'terminated' && (
        <FieldGrid title="Расторжение">
          <C.Date name="terminatedAt" label="Дата расторжения" />
          <C.Textarea name="terminationReason" label="Причина расторжения" />
        </FieldGrid>
      )}
    </>
  );
}

export function ContractsSection() {
  const columns: DataTableColumn<DraftRow<'contracts'>>[] = [
    { key: 'number', header: '№ договора', render: (row) => row.contractNumber },
    {
      key: 'concluded',
      header: 'Заключён',
      render: (row) => (row.concludedAt === null ? null : formatIsoDate(row.concludedAt)),
    },
    {
      key: 'validUntil',
      header: 'Срок действия',
      render: (row) => (row.validUntil === null ? 'бессрочно' : formatIsoDate(row.validUntil)),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (row) =>
        row.status === null ? null : (
          <Badge tone={CONTRACT_TONE[row.status]}>
            {labelIn(optionsOf('contractStatus'), row.status)}
          </Badge>
        ),
    },
    {
      key: 'method',
      header: 'Способ',
      render: (row) => labelIn(optionsOf('conclusionMethod'), row.conclusionMethod),
    },
  ];

  return (
    <RelatedSection
      table="contracts"
      caption="Договоры на вывоз ТКО"
      columns={columns}
      emptyText="Договоров нет"
      addLabel="Добавить договор"
      rowLabel={(row) => `договор ${row.contractNumber ?? ''}`.trim()}
      modalTitle={{ add: 'Новый договор', edit: 'Договор' }}
      form={<ContractForm />}
    />
  );
}
