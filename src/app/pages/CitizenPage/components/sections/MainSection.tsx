import { optionsOf } from 'api/dictionaries';
import type { Citizen } from 'types/entities';
import type { CitizenDraft } from 'types/form';
import { allowedStatuses } from 'utils/card';
import { formatIsoDateTime, formatYears } from 'utils/format';

import { FieldGrid, ViewPair, fieldsOf, useFormScope } from '../fields';

const F = fieldsOf<CitizenDraft>();

export function MainSection({ citizen }: { citizen: Citizen }) {
  const { values } = useFormScope();
  const statuses = allowedStatuses(citizen.status);
  const statusOptions = optionsOf('cardStatus').filter((option) =>
    statuses.some((status) => status === option.value)
  );

  return (
    <>
      <FieldGrid title="ФИО и пол">
        <F.Text name="lastName" label="Фамилия" />
        <F.Text name="firstName" label="Имя" />
        <F.Text name="middleName" label="Отчество" />
        <F.Select name="gender" label="Пол" options={optionsOf('gender')} />
        {values.gender === 'female' && (
          <F.Text name="previousLastName" label="Предыдущая фамилия" />
        )}
      </FieldGrid>
      <FieldGrid title="Рождение и гражданство">
        <F.Date name="birthDate" label="Дата рождения" />
        <ViewPair label="Возраст">{formatYears(citizen.age)}</ViewPair>
        <F.Text name="birthPlace" label="Место рождения" />
        <F.SearchSelect name="citizenship" label="Гражданство" options={optionsOf('citizenship')} />
      </FieldGrid>
      <FieldGrid title="Карточка">
        <ViewPair label="№ карточки">{citizen.cardNumber}</ViewPair>
        <F.Select name="status" label="Статус карточки" options={statusOptions} />
        <ViewPair label="Создана">{formatIsoDateTime(citizen.createdAt)}</ViewPair>
        <ViewPair label="Обновлена">{formatIsoDateTime(citizen.updatedAt)}</ViewPair>
      </FieldGrid>
    </>
  );
}
