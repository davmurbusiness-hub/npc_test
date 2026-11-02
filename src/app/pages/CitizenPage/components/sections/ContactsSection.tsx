import { optionsOf } from 'api/dictionaries';
import type { CitizenDraft } from 'types/form';

import { FieldGrid, fieldsOf } from '../fields';

const F = fieldsOf<CitizenDraft>();

const SPECIAL_NEEDS = optionsOf('specialNeed').filter((option) => option.value !== 'none');

export function ContactsSection() {
  return (
    <>
      <FieldGrid title="Телефон и почта">
        <F.Masked name="mobilePhone" label="Мобильный телефон" mask="phone" />
        <F.Masked name="extraPhone" label="Дополнительный телефон" mask="phone" />
        <F.Text name="email" label="Email" />
        <F.Select name="messenger" label="Мессенджер" options={optionsOf('messenger')} />
      </FieldGrid>
      <FieldGrid title="Как связываться">
        <F.Select name="contactChannel" label="Канал связи" options={optionsOf('contactChannel')} />
        <F.Select
          name="convenientTime"
          label="Удобное время"
          options={optionsOf('convenientTime')}
        />
        <F.SearchSelect name="language" label="Язык общения" options={optionsOf('language')} />
        <F.MultiSelect name="specialNeeds" label="Особые потребности" options={SPECIAL_NEEDS} />
      </FieldGrid>
    </>
  );
}
