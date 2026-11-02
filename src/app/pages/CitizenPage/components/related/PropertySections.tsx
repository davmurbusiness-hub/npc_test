import { optionsOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import type { DataTableColumn } from 'components/DataTable';
import { NoData } from 'components/NoData';
import type { DraftRow } from 'types/form';
import { addressText, objectText } from 'utils/citizen';
import { formatIsoDate, periodText, formatRubles, formatNumber } from 'utils/format';
import { formatMasked } from 'utils/masks';
import { CONTRACT_TONE, labelIn } from 'utils/ui';

import { useCitizen } from '../../context';
import { FieldGrid, fieldsOf, useFormScope } from '../fields';
import { RelatedSection } from './RelatedSection';
import { useRows } from './useRows';

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

const O = fieldsOf<DraftRow<'objects'>>();

function ObjectForm() {
  const addresses = useRows('addresses');
  const addressOptions = addresses.map((row) => ({
    value: row.id,
    label: addressText(row) || row.id,
  }));
  return (
    <>
      <FieldGrid title="Лицевой счёт">
        <O.Text name="accountNumber" label="№ лицевого счёта" />
        <O.Select name="type" label="Тип объекта" options={optionsOf('objectType')} />
        <O.Select name="addressId" label="Адрес" options={addressOptions} />
        <O.Text name="cadastralNumber" label="Кадастровый номер" />
      </FieldGrid>
      <FieldGrid title="Право и проживающие">
        <O.Number name="area" label="Площадь, м²" unit="м²" />
        <O.Select name="rightType" label="Право" options={optionsOf('rightType')} />
        <O.Number name="share" label="Доля, %" unit="%" />
        <O.Number name="residentsCount" label="Число проживающих" integer />
      </FieldGrid>
      <FieldGrid title="Вывоз ТКО">
        <O.Select
          name="wasteAccumulation"
          label="Способ накопления"
          options={optionsOf('wasteAccumulation')}
        />
        <O.Text name="containerSiteNumber" label="№ площадки" />
        <O.MultiSelect name="pickupSchedule" label="График вывоза" options={optionsOf('weekday')} />
        <O.Number name="tariff" label="Тариф, ₽/мес" unit="₽/мес" />
        <O.Date name="billingStartDate" label="Начало расчётов" />
      </FieldGrid>
    </>
  );
}

export function ObjectsSection() {
  const addresses = useRows('addresses');
  const savedObjects = useCitizen((state) => state.card?.related.objects);
  const debtOf = (id: string) => savedObjects?.find((object) => object.id === id)?.debt ?? null;

  const columns: DataTableColumn<DraftRow<'objects'>>[] = [
    { key: 'account', header: '№ ЛС', render: (row) => row.accountNumber },
    { key: 'type', header: 'Тип', render: (row) => labelIn(optionsOf('objectType'), row.type) },
    {
      key: 'address',
      header: 'Адрес',
      render: (row) => {
        const address = addresses.find((item) => item.id === row.addressId);
        return address === undefined ? <NoData /> : addressText(address);
      },
    },
    {
      key: 'area',
      header: 'Площадь',
      align: 'end',
      render: (row) => (row.area === null ? null : `${formatNumber(row.area, 'decimal')} м²`),
    },
    {
      key: 'right',
      header: 'Право',
      render: (row) => labelIn(optionsOf('rightType'), row.rightType),
    },
    { key: 'residents', header: 'Проживает', align: 'end', render: (row) => row.residentsCount },
    { key: 'tariff', header: 'Тариф', align: 'end', render: (row) => formatRubles(row.tariff) },
    { key: 'debt', header: 'Долг', align: 'end', render: (row) => formatRubles(debtOf(row.id)) },
  ];

  return (
    <RelatedSection
      table="objects"
      caption="Объекты и лицевые счета"
      columns={columns}
      emptyText="Объектов нет"
      addLabel="Добавить объект"
      rowLabel={objectText}
      modalTitle={{ add: 'Новый объект', edit: 'Объект' }}
      form={<ObjectForm />}
    />
  );
}

const C = fieldsOf<DraftRow<'contracts'>>();

function ContractForm() {
  const objects = useRows('objects');
  const { values } = useFormScope();
  const objectOptions = objects.map((row) => ({ value: row.id, label: objectText(row) }));
  return (
    <>
      <FieldGrid title="Договор">
        <C.Text name="contractNumber" label="№ договора" />
        <C.Select name="objectId" label="Объект" options={objectOptions} />
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
  const objects = useRows('objects');
  const columns: DataTableColumn<DraftRow<'contracts'>>[] = [
    { key: 'number', header: '№ договора', render: (row) => row.contractNumber },
    {
      key: 'object',
      header: 'Объект',
      render: (row) => {
        const object = objects.find((item) => item.id === row.objectId);
        return object === undefined ? <NoData /> : objectText(object);
      },
    },
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
