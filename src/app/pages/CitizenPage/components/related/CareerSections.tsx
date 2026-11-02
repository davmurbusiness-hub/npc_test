import { optionsOf } from 'api/dictionaries';
import { Badge } from 'components/Badge';
import type { DataTableColumn } from 'components/DataTable';
import type { DraftRow } from 'types/form';
import { periodText, formatRubles } from 'utils/format';
import { EDUCATION_TONE, labelIn } from 'utils/ui';

import { FieldGrid, fieldsOf, useFormScope } from '../fields';
import { RelatedSection } from './RelatedSection';

const E = fieldsOf<DraftRow<'education'>>();

const EDUCATION_COLUMNS: readonly DataTableColumn<DraftRow<'education'>>[] = [
  {
    key: 'level',
    header: 'Уровень',
    render: (row) => labelIn(optionsOf('educationLevel'), row.level),
  },
  {
    key: 'institution',
    header: 'Учебное заведение',
    render: (row) => labelIn(optionsOf('institution'), row.institution),
  },
  {
    key: 'specialty',
    header: 'Специальность',
    render: (row) => labelIn(optionsOf('specialty'), row.specialty),
  },
  {
    key: 'years',
    header: 'Годы',
    render: (row) =>
      row.admissionYear === null ? null : `${row.admissionYear}–${row.graduationYear ?? '…'}`,
  },
  {
    key: 'status',
    header: 'Статус',
    render: (row) =>
      row.status === null ? null : (
        <Badge tone={EDUCATION_TONE[row.status]}>
          {labelIn(optionsOf('educationStatus'), row.status)}
        </Badge>
      ),
  },
];

export function EducationSection() {
  return (
    <RelatedSection
      table="education"
      caption="Образование"
      columns={EDUCATION_COLUMNS}
      emptyText="Записей об образовании нет"
      addLabel="Добавить образование"
      rowLabel={(row) => labelIn(optionsOf('institution'), row.institution) ?? 'образование'}
      modalTitle={{ add: 'Новая запись об образовании', edit: 'Образование' }}
      form={
        <>
          <FieldGrid title="Учебное заведение">
            <E.Select name="level" label="Уровень" options={optionsOf('educationLevel')} />
            <E.SearchSelect
              name="institution"
              label="Учебное заведение"
              options={optionsOf('institution')}
            />
            <E.SearchSelect
              name="specialty"
              label="Специальность"
              options={optionsOf('specialty')}
            />
            <E.Select name="studyForm" label="Форма обучения" options={optionsOf('studyForm')} />
            <E.Select name="status" label="Статус" options={optionsOf('educationStatus')} />
          </FieldGrid>
          <FieldGrid title="Годы и документ">
            <E.Number name="admissionYear" label="Год поступления" integer format="count" />
            <E.Number name="graduationYear" label="Год окончания" integer format="count" />
            <E.Text name="documentSeries" label="Серия документа" />
            <E.Text name="documentNumber" label="Номер документа" />
          </FieldGrid>
        </>
      }
    />
  );
}

const W = fieldsOf<DraftRow<'employment'>>();

function EmploymentForm() {
  const { values } = useFormScope();
  return (
    <>
      <FieldGrid title="Место работы">
        <W.SearchSelect
          name="organization"
          label="Организация"
          options={optionsOf('organization')}
        />
        <W.SearchSelect name="position" label="Должность" options={optionsOf('position')} />
        <W.Select name="type" label="Вид занятости" options={optionsOf('employmentType')} />
        <W.Number name="income" label="Доход, ₽/мес" unit="₽/мес" />
      </FieldGrid>
      <FieldGrid title="Период">
        <W.Date name="from" label="С" />
        <W.Switch name="isCurrent" label="Текущее место" />
        {values.isCurrent !== true && <W.Date name="to" label="По" />}
      </FieldGrid>
    </>
  );
}

const EMPLOYMENT_COLUMNS: readonly DataTableColumn<DraftRow<'employment'>>[] = [
  {
    key: 'organization',
    header: 'Организация',
    render: (row) => labelIn(optionsOf('organization'), row.organization),
  },
  {
    key: 'position',
    header: 'Должность',
    render: (row) => labelIn(optionsOf('position'), row.position),
  },
  { key: 'type', header: 'Вид', render: (row) => labelIn(optionsOf('employmentType'), row.type) },
  {
    key: 'period',
    header: 'Период',
    render: (row) =>
      row.isCurrent
        ? `${periodText(row.from, null, '')} по наст. вр.`
        : periodText(row.from, row.to),
  },
  { key: 'income', header: 'Доход', align: 'end', render: (row) => formatRubles(row.income) },
];

export function EmploymentSection() {
  return (
    <RelatedSection
      table="employment"
      caption="Занятость"
      columns={EMPLOYMENT_COLUMNS}
      emptyText="Записей о занятости нет"
      addLabel="Добавить место работы"
      rowLabel={(row) => labelIn(optionsOf('organization'), row.organization) ?? 'место работы'}
      modalTitle={{ add: 'Новое место работы', edit: 'Место работы' }}
      form={<EmploymentForm />}
    />
  );
}
