import { optionsOf } from 'api/dictionaries';
import type { CitizenDraft } from 'types/form';

import { DuplicateAlert } from '../DuplicateAlert';
import { FieldGrid, fieldsOf, useFormScope } from '../fields';

const F = fieldsOf<CitizenDraft>();

export function DocumentsSection() {
  const { values } = useFormScope();
  const passport = values.documentType === 'passportRf';

  return (
    <>
      <FieldGrid title="Удостоверение личности">
        <F.Select name="documentType" label="Тип документа" options={optionsOf('documentType')} />
        {passport ? (
          <>
            <F.Masked name="documentSeries" label="Серия" mask="passportSeries" />
            <F.Masked name="documentNumber" label="Номер" mask="passportNumber" />
          </>
        ) : (
          <>
            <F.Text name="documentSeries" label="Серия" />
            <F.Text name="documentNumber" label="Номер" />
          </>
        )}
        <F.Text name="documentIssuedBy" label="Кем выдан" />
        <F.Date name="documentIssuedAt" label="Дата выдачи" />
        {passport && (
          <F.Masked name="documentDepartmentCode" label="Код подразделения" mask="departmentCode" />
        )}
        <F.Date name="documentValidUntil" label="Срок действия" deadline />
      </FieldGrid>
      <FieldGrid title="СНИЛС и ИНН">
        <F.Masked name="snils" label="СНИЛС" mask="snils" />
        <F.Masked name="inn" label="ИНН" mask="inn" />
      </FieldGrid>
      <DuplicateAlert />
    </>
  );
}
