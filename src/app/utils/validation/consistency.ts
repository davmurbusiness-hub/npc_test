import type { CardDraft, FieldIssue } from 'types/form';
import { pensionAge } from 'utils/citizen';

import { ageOn, issueSink } from './rules';

import type { ValidationContext } from './rules';

export function validateConsistency(draft: CardDraft, ctx: ValidationContext): FieldIssue[] {
  const { citizen, related } = draft;
  const list: FieldIssue[] = [];
  const card = issueSink('citizens', null, list);
  const age = ageOn(citizen.birthDate, ctx.today);

  if (citizen.employmentStatus === 'pensioner' && age !== null && citizen.gender !== null) {
    if (age < pensionAge(citizen.gender)) {
      card.add('employmentStatus', 'consistency', 'Пенсионер — с 55 лет (жен.) или 60 лет (муж.)');
    }
  }

  const hasSpouse = related.familyMembers.some((member) => member.relation === 'spouse');
  if (citizen.maritalStatus === 'married' && !hasSpouse) {
    card.add('maritalStatus', 'consistency', 'Добавьте супруга(у) в «Члены семьи»');
  }
  if (citizen.maritalStatus !== 'married' && citizen.maritalStatus !== null && hasSpouse) {
    card.add('maritalStatus', 'consistency', 'В «Членах семьи» есть супруг(а)');
  }

  return list;
}
