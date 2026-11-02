import { optionsOf } from 'api/dictionaries';
import type { CitizenDraft } from 'types/form';

import { FieldGrid, fieldsOf, useFormScope } from '../fields';

const F = fieldsOf<CitizenDraft>();

export function DigitalSection() {
  const { values } = useFormScope();

  return (
    <>
      <FieldGrid title="Госуслуги и личный кабинет">
        <F.Select
          name="govServicesAccount"
          label="Учётная запись Госуслуг"
          options={optionsOf('govServicesAccount')}
        />
        <F.Switch name="hasPersonalAccount" label="Личный кабинет" />
        {values.hasPersonalAccount === true && (
          <F.Date name="personalAccountRegisteredAt" label="Дата регистрации в ЛК" />
        )}
      </FieldGrid>
      <FieldGrid title="Квитанции и оплата">
        <F.Select
          name="receiptDelivery"
          label="Способ получения квитанций"
          options={optionsOf('receiptDelivery')}
        />
        <F.Switch name="autopay" label="Автоплатёж" />
        <F.Switch name="eSignature" label="Электронная подпись" />
      </FieldGrid>
    </>
  );
}
