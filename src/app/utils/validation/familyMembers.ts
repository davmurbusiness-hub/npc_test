import type { FamilyCategory } from 'types/dictionaries';
import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';
import { pensionAge } from 'utils/citizen';

import {
  ageOn,
  checkCyrillic,
  checkNotFuture,
  checkOrder,
  checkRequired,
  checkSnils,
  issueSink,
} from './rules';

import type { RowContext } from './rules';

function categoryMismatch(category: FamilyCategory, age: number, row: DraftRow<'familyMembers'>) {
  switch (category) {
    case 'preschooler':
      return age < 7 ? null : 'Дошкольник — младше 7 лет';
    case 'schoolchild':
      return age >= 7 && age <= 17 ? null : 'Школьник — от 7 до 17 лет';
    case 'student':
      return age >= 17 && age <= 25 ? null : 'Студент — от 17 до 25 лет';
    case 'pensioner':
      return age >= pensionAge(row.gender ?? 'female')
        ? null
        : 'Пенсионер — с 55 лет (жен.) или 60 лет (муж.)';
    case 'working':
      return null;
  }
}

export function validateFamilyMember(
  row: DraftRow<'familyMembers'>,
  ctx: RowContext
): FieldIssue[] {
  const sink = issueSink('familyMembers', row.id);
  checkRequired(sink, row, ROW_REQUIRED.familyMembers);
  checkCyrillic(sink, 'fullName', row.fullName);
  checkNotFuture(sink, 'birthDate', row.birthDate, ctx.today);
  checkOrder(sink, 'registeredFrom', row.birthDate, row.registeredFrom, 'Раньше даты рождения');
  checkSnils(sink, 'snils', row.snils);

  const age = ageOn(row.birthDate, ctx.today);
  if (age !== null && row.category !== null) {
    const message = categoryMismatch(row.category, age, row);
    if (message !== null) sink.add('category', 'consistency', message);
  }
  return sink.list;
}
