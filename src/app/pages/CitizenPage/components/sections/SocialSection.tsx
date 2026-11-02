import { optionsOf } from 'api/dictionaries';
import type { Citizen } from 'types/entities';
import type { CitizenDraft } from 'types/form';

import { FieldGrid, ViewPair, fieldsOf } from '../fields';

const F = fieldsOf<CitizenDraft>();

export function SocialSection({ citizen }: { citizen: Citizen }) {
  return (
    <FieldGrid>
      <F.Select
        name="maritalStatus"
        label="Семейное положение"
        options={optionsOf('maritalStatus')}
      />
      <F.Select name="employmentStatus" label="Занятость" options={optionsOf('employmentStatus')} />
      <F.Select
        name="disabilityGroup"
        label="Группа инвалидности"
        options={optionsOf('disabilityGroup')}
      />
      <ViewPair label="Число иждивенцев">{String(citizen.dependentsCount)}</ViewPair>
    </FieldGrid>
  );
}
