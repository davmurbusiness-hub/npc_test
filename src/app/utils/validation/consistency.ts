import type { EmploymentStatus, EmploymentType } from 'types/dictionaries';
import type { CardDraft, FieldIssue } from 'types/form';
import { pensionAge } from 'utils/citizen';

import { ageOn, issueSink } from './rules';

import type { ValidationContext } from './rules';

const STATUS_BY_TYPE: Readonly<Record<EmploymentType, EmploymentStatus>> = {
  hired: 'employed',
  selfEmployed: 'selfEmployed',
  individualEntrepreneur: 'selfEmployed',
};

export function validateConsistency(draft: CardDraft, ctx: ValidationContext): FieldIssue[] {
  const { citizen, related } = draft;
  const list: FieldIssue[] = [];
  const card = issueSink('citizens', null, list);
  const age = ageOn(citizen.birthDate, ctx.today);

  const hasDisabledBenefit = related.benefits.some(
    (benefit) =>
      benefit.kind === 'disabled' &&
      benefit.beneficiary === 'applicant' &&
      benefit.verification !== 'expired' &&
      benefit.verification !== 'rejected'
  );
  if (
    citizen.disabilityGroup !== null &&
    citizen.disabilityGroup !== 'none' &&
    !hasDisabledBenefit
  ) {
    card.add(
      'disabilityGroup',
      'consistency',
      'Нужна льгота «инвалид» заявителю: подтверждена или на проверке'
    );
  }
  if (citizen.disabilityGroup === 'none' && hasDisabledBenefit) {
    card.add('disabilityGroup', 'consistency', 'Есть льгота «инвалид» — укажите группу');
  }

  const kids = related.familyMembers.filter((member) => {
    const memberAge = ageOn(member.birthDate, ctx.today);
    return member.relation === 'child' && memberAge !== null && memberAge < 18;
  }).length;
  const largeFamily = related.benefits.filter((benefit) => benefit.kind === 'largeFamily');
  if (kids < 3) {
    for (const benefit of largeFamily) {
      issueSink('benefits', benefit.id, list).add(
        'kind',
        'consistency',
        'Многодетной семье нужно не меньше 3 детей младше 18 в «Членах семьи»'
      );
    }
  } else if (largeFamily.length === 0) {
    issueSink('benefits', null, list).add(
      'kind',
      'consistency',
      `В семье ${kids} детей младше 18 — нужна льгота «многодетная семья»`
    );
  }

  const current = related.employment.filter((row) => row.isCurrent === true && row.type !== null);
  const status = citizen.employmentStatus;
  for (const row of current) {
    if (row.type !== null && STATUS_BY_TYPE[row.type] !== status) {
      card.add('employmentStatus', 'consistency', 'Не совпадает с текущим местом в «Занятости»');
      break;
    }
  }
  if (
    (status === 'employed' || status === 'selfEmployed') &&
    !current.some((row) => row.type !== null && STATUS_BY_TYPE[row.type] === status)
  ) {
    card.add('employmentStatus', 'consistency', 'Добавьте текущее место в «Занятость»');
  }
  if (status === 'pensioner' && age !== null && citizen.gender !== null) {
    if (age < pensionAge(citizen.gender)) {
      card.add('employmentStatus', 'consistency', 'Пенсионер — с 55 лет (жен.) или 60 лет (муж.)');
    }
  }
  if (status === 'student' && !related.education.some((row) => row.status === 'studying')) {
    card.add(
      'employmentStatus',
      'consistency',
      'Нужна запись в «Образовании» со статусом «учится»'
    );
  }

  const hasSpouse = related.familyMembers.some((member) => member.relation === 'spouse');
  if (citizen.maritalStatus === 'married' && !hasSpouse) {
    card.add('maritalStatus', 'consistency', 'Добавьте супруга(у) в «Члены семьи»');
  }
  if (citizen.maritalStatus !== 'married' && citizen.maritalStatus !== null && hasSpouse) {
    card.add('maritalStatus', 'consistency', 'В «Членах семьи» есть супруг(а)');
  }

  for (const object of related.objects) {
    const linked = related.familyMembers.filter((member) => member.objectId === object.id).length;
    if (object.residentsCount !== null && object.residentsCount < linked) {
      issueSink('objects', object.id, list).add(
        'residentsCount',
        'consistency',
        `Меньше, чем членов семьи на объекте: ${linked}`
      );
    }
  }

  return list;
}
