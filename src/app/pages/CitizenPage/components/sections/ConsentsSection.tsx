import { optionsOf } from 'api/dictionaries';
import type { CitizenDraft } from 'types/form';

import { FieldGrid, fieldsOf, useFormScope } from '../fields';

const F = fieldsOf<CitizenDraft>();

export function ConsentsSection() {
  const { values } = useFormScope();
  const consent = values.pdConsent === true;
  const hint = consent ? undefined : 'Нужно согласие на обработку ПДн';

  return (
    <>
      <FieldGrid title="Обработка персональных данных">
        <F.Switch name="pdConsent" label="Согласие на обработку ПДн" />
        {consent && (
          <>
            <F.Date name="pdConsentDate" label="Дата согласия" />
            <F.Date name="pdConsentUntil" label="Действует до" deadline />
            <F.Select
              name="consentConfirmation"
              label="Способ подтверждения"
              options={optionsOf('consentConfirmation')}
            />
          </>
        )}
      </FieldGrid>
      <FieldGrid title="Рассылки">
        <F.Switch name="smsConsent" label="СМС-уведомления" off={!consent} hint={hint} />
        <F.Switch name="emailConsent" label="Email-рассылка" off={!consent} hint={hint} />
        <F.Switch
          name="surveyConsent"
          label="Опросы удовлетворённости"
          off={!consent}
          hint={hint}
        />
      </FieldGrid>
    </>
  );
}
