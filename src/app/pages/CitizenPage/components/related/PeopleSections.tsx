import { optionsOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import type { DataTableColumn } from 'components/DataTable';
import type { DraftRow } from 'types/form';
import { objectText } from 'utils/citizen';
import { formatDiscount, formatIsoDate, formatYears, periodText } from 'utils/format';
import { formatMasked } from 'utils/masks';
import { REPRESENTATIVE_TONE, VERIFICATION_TONE, labelIn } from 'utils/ui';
import { ageOn } from 'utils/validation';

import { useCitizenStore } from '../../context';
import { DeadlineBadge, FieldGrid, fieldsOf, useFormScope } from '../fields';
import styles from './related.module.scss';
import { RelatedSection } from './RelatedSection';
import { useRows } from './useRows';

const M = fieldsOf<DraftRow<'familyMembers'>>();

function FamilyForm() {
  const objects = useRows('objects');
  const objectOptions = objects.map((row) => ({ value: row.id, label: objectText(row) }));
  return (
    <>
      <FieldGrid title="Кто">
        <M.Text name="fullName" label="ФИО" />
        <M.Select name="relation" label="Степень родства" options={optionsOf('familyRelation')} />
        <M.Date name="birthDate" label="Дата рождения" />
        <M.Select name="gender" label="Пол" options={optionsOf('gender')} />
        <M.Select name="category" label="Категория" options={optionsOf('familyCategory')} />
        <M.Switch name="isDependent" label="Иждивенец" />
      </FieldGrid>
      <FieldGrid title="Проживание и документы">
        <M.Select name="residence" label="Проживание" options={optionsOf('familyResidence')} />
        <M.Date name="registeredFrom" label="Зарегистрирован с" />
        <M.Select name="objectId" label="Объект" options={objectOptions} />
        <M.Text name="documentNumber" label="Номер документа" />
        <M.Masked name="snils" label="СНИЛС" mask="snils" />
        <M.Text name="studyOrWorkPlace" label="Место учёбы или работы" />
      </FieldGrid>
    </>
  );
}

export function FamilySection() {
  const { today } = useCitizenStore();
  const objects = useRows('objects');
  const columns: DataTableColumn<DraftRow<'familyMembers'>>[] = [
    { key: 'name', header: 'ФИО', render: (row) => row.fullName },
    {
      key: 'relation',
      header: 'Родство',
      render: (row) => labelIn(optionsOf('familyRelation'), row.relation),
    },
    {
      key: 'birth',
      header: 'Дата рождения',
      render: (row) => {
        const age = ageOn(row.birthDate, today);
        return row.birthDate === null
          ? null
          : `${formatIsoDate(row.birthDate)}${age === null ? '' : `, ${formatYears(age)}`}`;
      },
    },
    {
      key: 'category',
      header: 'Категория',
      render: (row) => labelIn(optionsOf('familyCategory'), row.category),
    },
    { key: 'dependent', header: 'Иждивенец', render: (row) => (row.isDependent ? 'да' : 'нет') },
    {
      key: 'object',
      header: 'Объект',
      render: (row) => {
        const object = objects.find((item) => item.id === row.objectId);
        return object === undefined ? null : objectText(object);
      },
    },
  ];

  return (
    <RelatedSection
      table="familyMembers"
      caption="Члены семьи"
      columns={columns}
      emptyText="Членов семьи нет"
      addLabel="Добавить члена семьи"
      rowLabel={(row) => row.fullName ?? 'член семьи'}
      modalTitle={{ add: 'Новый член семьи', edit: 'Член семьи' }}
      form={<FamilyForm />}
    />
  );
}

const B = fieldsOf<DraftRow<'benefits'>>();

function BenefitForm() {
  const members = useRows('familyMembers');
  const { values } = useFormScope();
  const memberOptions = members.map((row) => ({ value: row.id, label: row.fullName ?? row.id }));
  return (
    <>
      <FieldGrid title="Льгота">
        <B.Select name="kind" label="Вид льготы" options={optionsOf('benefitKind')} />
        <B.Select name="beneficiary" label="Кому" options={optionsOf('benefitBeneficiary')} />
        {values.beneficiary === 'familyMember' && (
          <B.Select name="familyMemberId" label="Член семьи" options={memberOptions} />
        )}
        <B.Number name="discountPercent" label="Скидка, %" unit="%" />
      </FieldGrid>
      <FieldGrid title="Документ-основание">
        <B.Text name="basisDocument" label="Документ-основание" />
        <B.Text name="number" label="Номер" />
        <B.Date name="issuedAt" label="Дата выдачи" />
        <B.Text name="issuedBy" label="Кем выдан" />
        <B.Date name="validFrom" label="Действует с" />
        <B.Date name="validTo" label="Действует по" />
      </FieldGrid>
      <FieldGrid title="Проверка">
        <B.Select
          name="verification"
          label="Статус проверки"
          options={optionsOf('benefitVerification')}
        />
        {values.verification === 'rejected' && (
          <B.Textarea name="rejectionReason" label="Причина отказа" />
        )}
      </FieldGrid>
    </>
  );
}

export function BenefitsSection() {
  const members = useRows('familyMembers');
  const columns: DataTableColumn<DraftRow<'benefits'>>[] = [
    { key: 'kind', header: 'Вид', render: (row) => labelIn(optionsOf('benefitKind'), row.kind) },
    {
      key: 'whom',
      header: 'Кому',
      render: (row) =>
        row.beneficiary === 'familyMember'
          ? (members.find((member) => member.id === row.familyMemberId)?.fullName ?? 'член семьи')
          : 'заявитель',
    },
    {
      key: 'document',
      header: 'Документ',
      render: (row) => [row.basisDocument, row.number].filter(Boolean).join(', '),
    },
    {
      key: 'period',
      header: 'Действует',
      render: (row) => (
        <span className={styles.inline}>
          {periodText(row.validFrom, row.validTo)}
          {row.verification === 'confirmed' && <DeadlineBadge date={row.validTo} />}
        </span>
      ),
    },
    {
      key: 'discount',
      header: 'Скидка',
      align: 'end',
      render: (row) => (row.discountPercent === null ? null : formatDiscount(row.discountPercent)),
    },
    {
      key: 'verification',
      header: 'Проверка',
      render: (row) => {
        const verification = row.verification ?? 'onReview';
        return (
          <Badge tone={VERIFICATION_TONE[verification]}>
            {labelIn(optionsOf('benefitVerification'), verification)}
          </Badge>
        );
      },
    },
  ];

  return (
    <RelatedSection
      table="benefits"
      caption="Льготы"
      columns={columns}
      emptyText="Льгот нет"
      addLabel="Добавить льготу"
      rowLabel={(row) => labelIn(optionsOf('benefitKind'), row.kind) ?? 'льгота'}
      modalTitle={{ add: 'Новая льгота', edit: 'Льгота' }}
      form={<BenefitForm />}
    />
  );
}

const R = fieldsOf<DraftRow<'representatives'>>();

const REPRESENTATIVE_COLUMNS: readonly DataTableColumn<DraftRow<'representatives'>>[] = [
  { key: 'name', header: 'ФИО', render: (row) => row.fullName },
  {
    key: 'type',
    header: 'Тип',
    render: (row) => labelIn(optionsOf('representativeType'), row.type),
  },
  { key: 'number', header: '№ доверенности', render: (row) => row.powerOfAttorneyNumber },
  {
    key: 'validUntil',
    header: 'Срок действия',
    render: (row) =>
      row.validUntil === null ? null : (
        <span className={styles.inline}>
          {formatIsoDate(row.validUntil)}
          {row.status === 'active' && <DeadlineBadge date={row.validUntil} />}
        </span>
      ),
  },
  {
    key: 'powers',
    header: 'Полномочия',
    render: (row) =>
      (row.powers ?? [])
        .map((power) => labelIn(optionsOf('representativePower'), power))
        .join(', '),
  },
  {
    key: 'document',
    header: 'Документ',
    render: (row) => formatMasked('seriesNumber', row.documentSeriesNumber),
  },
  {
    key: 'status',
    header: 'Статус',
    render: (row) =>
      row.status === null ? null : (
        <Badge tone={REPRESENTATIVE_TONE[row.status]}>
          {labelIn(optionsOf('representativeStatus'), row.status)}
        </Badge>
      ),
  },
];

export function RepresentativesSection() {
  return (
    <RelatedSection
      table="representatives"
      caption="Представители"
      columns={REPRESENTATIVE_COLUMNS}
      emptyText="Представителей нет"
      addLabel="Добавить представителя"
      rowLabel={(row) => row.fullName ?? 'представитель'}
      modalTitle={{ add: 'Новый представитель', edit: 'Представитель' }}
      form={
        <>
          <FieldGrid title="Представитель">
            <R.Text name="fullName" label="ФИО" />
            <R.Select name="type" label="Тип" options={optionsOf('representativeType')} />
            <R.Text name="contact" label="Контакт" />
            <R.Masked
              name="documentSeriesNumber"
              label="Документ (серия, номер)"
              mask="seriesNumber"
            />
          </FieldGrid>
          <FieldGrid title="Доверенность">
            <R.Text name="powerOfAttorneyNumber" label="№ доверенности" />
            <R.Date name="issuedAt" label="Дата выдачи" />
            <R.Date name="validUntil" label="Срок действия" />
            <R.MultiSelect
              name="powers"
              label="Полномочия"
              options={optionsOf('representativePower')}
            />
            <R.Select name="status" label="Статус" options={optionsOf('representativeStatus')} />
          </FieldGrid>
        </>
      }
    />
  );
}
