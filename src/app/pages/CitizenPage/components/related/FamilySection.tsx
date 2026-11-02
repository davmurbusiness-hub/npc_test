import { optionsOf } from 'api/dictionaries';
import type { DataTableColumn } from 'components/DataTable';
import type { DraftRow } from 'types/form';
import { formatIsoDate, formatYears } from 'utils/format';
import { labelIn } from 'utils/ui';
import { ageOn } from 'utils/validation';

import { useCitizenStore } from '../../context';
import { FieldGrid, fieldsOf } from '../fields';
import { RelatedSection } from './RelatedSection';

const M = fieldsOf<DraftRow<'familyMembers'>>();

function FamilyForm() {
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
        <M.Text name="documentNumber" label="Номер документа" />
        <M.Masked name="snils" label="СНИЛС" mask="snils" />
        <M.Text name="studyOrWorkPlace" label="Место учёбы или работы" />
      </FieldGrid>
    </>
  );
}

export function FamilySection() {
  const { today } = useCitizenStore();
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
