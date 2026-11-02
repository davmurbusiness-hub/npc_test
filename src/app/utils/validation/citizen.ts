import type { FieldIssue, CitizenDraft } from 'types/form';
import { CITIZEN_REQUIRED, allowedStatuses } from 'utils/card';
import { addYears, daysToIso, isoToDays } from 'utils/isoDate';

import {
  checkCyrillic,
  checkEmail,
  checkMask,
  checkNotFuture,
  checkOrder,
  checkRequired,
  checkSnils,
  isIsoDate,
  issueSink,
  requireWhen,
} from './rules';

import type { ValidationContext } from './rules';

const MALE_PATRONYMIC = /(вич|ич|оглы|улы)$/i;
const FEMALE_PATRONYMIC = /(вна|чна|кызы|гызы)$/i;

export function validateCitizen(citizen: CitizenDraft, ctx: ValidationContext): FieldIssue[] {
  const sink = issueSink('citizens', null);
  const { today } = ctx;
  checkRequired(sink, citizen, CITIZEN_REQUIRED);

  checkCyrillic(sink, 'lastName', citizen.lastName);
  checkCyrillic(sink, 'firstName', citizen.firstName);
  checkCyrillic(sink, 'middleName', citizen.middleName);
  checkCyrillic(sink, 'previousLastName', citizen.previousLastName);
  checkNotFuture(sink, 'birthDate', citizen.birthDate, today);
  if (isIsoDate(citizen.birthDate) && citizen.birthDate < '1900-01-01') {
    sink.add('birthDate', 'range', 'Дата рождения не раньше 1900 года');
  }
  const middle = citizen.middleName?.trim() ?? '';
  if (
    (citizen.gender === 'male' && FEMALE_PATRONYMIC.test(middle)) ||
    (citizen.gender === 'female' && MALE_PATRONYMIC.test(middle))
  ) {
    sink.add('middleName', 'consistency', 'Отчество не соответствует полу');
  }

  requireWhen(sink, 'reviewReason', citizen.reviewReason, citizen.status === 'review');
  requireWhen(sink, 'originalCardId', citizen.originalCardId, citizen.status === 'duplicate');
  requireWhen(sink, 'archiveReason', citizen.archiveReason, citizen.status === 'archived');
  if (citizen.originalCardId === ctx.citizenId) {
    sink.add('originalCardId', 'consistency', 'Карточка не может быть дубликатом самой себя');
  }
  if (citizen.status !== null && !allowedStatuses(ctx.previousStatus).includes(citizen.status)) {
    sink.add('status', 'consistency', 'В этот статус из текущего перейти нельзя');
  }

  const phoneMessage = 'Телефон в формате +7 (XXX) XXX-XX-XX';
  checkMask(sink, 'mobilePhone', citizen.mobilePhone, 'phone', phoneMessage);
  checkMask(sink, 'extraPhone', citizen.extraPhone, 'phone', phoneMessage);
  checkEmail(sink, 'email', citizen.email);
  if (citizen.mobilePhone === null && citizen.email === null) {
    sink.add(
      'mobilePhone',
      'required',
      'Нет ни мобильного, ни email: гражданин недоступен для уведомлений',
      'warning'
    );
  }
  switch (citizen.contactChannel) {
    case 'sms':
      if (citizen.mobilePhone === null || citizen.smsConsent !== true) {
        sink.add('contactChannel', 'consistency', 'Для СМС нужны мобильный и согласие на СМС');
      }
      break;
    case 'email':
      if (citizen.email === null || citizen.emailConsent !== true) {
        sink.add('contactChannel', 'consistency', 'Для Email нужны адрес и согласие на рассылку');
      }
      break;
    case 'personalAccount':
      if (citizen.hasPersonalAccount !== true) {
        sink.add('contactChannel', 'consistency', 'У гражданина нет личного кабинета');
      }
      break;
    case 'post':
    case 'inPerson':
    case null:
      break;
  }

  if (citizen.documentType === 'passportRf') {
    checkMask(sink, 'documentSeries', citizen.documentSeries, 'passportSeries', 'Серия — 4 цифры');
    checkMask(sink, 'documentNumber', citizen.documentNumber, 'passportNumber', 'Номер — 6 цифр');
    checkMask(
      sink,
      'documentDepartmentCode',
      citizen.documentDepartmentCode,
      'departmentCode',
      'Код подразделения в формате XXX-XXX'
    );
    if (isIsoDate(citizen.birthDate) && isIsoDate(citizen.documentIssuedAt)) {
      const fourteen = daysToIso(addYears(isoToDays(citizen.birthDate), 14));
      if (citizen.documentIssuedAt < fourteen) {
        sink.add('documentIssuedAt', 'order', 'Паспорт РФ выдают не раньше 14 лет');
      }
    }
  }
  checkNotFuture(sink, 'documentIssuedAt', citizen.documentIssuedAt, today);
  checkOrder(
    sink,
    'documentValidUntil',
    citizen.documentIssuedAt,
    citizen.documentValidUntil,
    'Срок действия раньше даты выдачи'
  );
  if (isIsoDate(citizen.documentValidUntil) && citizen.documentValidUntil < today) {
    sink.add('documentValidUntil', 'range', 'Срок действия документа истёк', 'warning');
  }
  checkSnils(sink, 'snils', citizen.snils);
  checkMask(sink, 'inn', citizen.inn, 'inn', 'ИНН — 12 цифр');

  checkNotFuture(sink, 'personalAccountRegisteredAt', citizen.personalAccountRegisteredAt, today);
  checkNotFuture(sink, 'pdConsentDate', citizen.pdConsentDate, today);
  checkOrder(
    sink,
    'pdConsentUntil',
    citizen.pdConsentDate,
    citizen.pdConsentUntil,
    '«Действует до» раньше даты согласия'
  );
  checkNotFuture(sink, 'lastContactAt', citizen.lastContactAt, today);

  return sink.list;
}
