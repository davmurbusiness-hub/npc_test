import type { DictValue } from 'types/common';
import type {
  AddressType,
  ArchiveReason,
  CardSource,
  CardStatus,
  CitizenTag,
  ConclusionMethod,
  ConsentConfirmation,
  ContactChannel,
  ContractStatus,
  ConvenientTime,
  Dictionaries,
  DictionaryItem,
  DisabilityGroup,
  DocumentType,
  EmploymentStatus,
  FamilyCategory,
  FamilyRelation,
  FamilyResidence,
  Gender,
  GovServicesAccount,
  Messenger,
  ReceiptDelivery,
  ReviewReason,
  SpecialNeed,
} from 'types/dictionaries';

type Pair<T extends string> = readonly [value: T, label: string];

function dict<T extends string>(pairs: readonly Pair<T>[]): readonly DictionaryItem[] {
  return pairs.map(([value, label]) => ({ value, label }));
}

const codeOf = (prefix: string, index: number): DictValue =>
  `${prefix}${String(index + 1).padStart(2, '0')}`;

function numbered(prefix: string, labels: readonly string[]): readonly DictionaryItem[] {
  return labels.map((label, index) => ({ value: codeOf(prefix, index), label }));
}

const DISTRICT_LABELS = [
  'Центральный',
  'Северный',
  'Южный',
  'Западный',
  'Восточный',
  'Заречный',
  'Приморский',
  'Железнодорожный',
  'Октябрьский',
  'Советский',
  'Промышленный',
  'Заводской',
] as const;

const RESPONSIBLE_LABELS = [
  'Соколова А. Н.',
  'Морозов Д. В.',
  'Лебедева Е. С.',
  'Волков И. П.',
  'Кузнецова М. А.',
  'Орлов С. Г.',
  'Павлова Т. Ю.',
  'Никитин А. Р.',
  'Захарова О. В.',
  'Громов В. Д.',
  'Фролова Н. И.',
  'Тарасов К. М.',
  'Белова Ю. А.',
  'Зайцев П. Л.',
  'Козлова Я. Е.',
] as const;

export const DICTIONARIES: Dictionaries = {
  cardStatus: dict<CardStatus>([
    ['active', 'Активна'],
    ['review', 'На проверке'],
    ['archived', 'Архив'],
    ['duplicate', 'Дубликат'],
  ]),
  gender: dict<Gender>([
    ['male', 'Мужской'],
    ['female', 'Женский'],
  ]),
  messenger: dict<Messenger>([
    ['telegram', 'Telegram'],
    ['max', 'MAX'],
    ['whatsapp', 'WhatsApp'],
    ['none', 'Нет'],
  ]),
  contactChannel: dict<ContactChannel>([
    ['email', 'Email'],
    ['sms', 'СМС'],
    ['post', 'Почта'],
    ['personalAccount', 'Личный кабинет'],
    ['inPerson', 'Лично'],
  ]),
  convenientTime: dict<ConvenientTime>([
    ['morning', 'Утро'],
    ['day', 'День'],
    ['evening', 'Вечер'],
  ]),
  specialNeed: dict<SpecialNeed>([
    ['limitedMobility', 'Маломобильный'],
    ['lowVision', 'Слабовидящий'],
    ['signLanguage', 'Сурдопереводчик'],
    ['none', 'Нет'],
  ]),
  documentType: dict<DocumentType>([
    ['passportRf', 'Паспорт РФ'],
    ['residencePermit', 'Вид на жительство'],
    ['foreignPassport', 'Загранпаспорт'],
    ['militaryId', 'Военный билет'],
  ]),
  disabilityGroup: dict<DisabilityGroup>([
    ['none', 'Нет'],
    ['I', 'I группа'],
    ['II', 'II группа'],
    ['III', 'III группа'],
  ]),
  employmentStatus: dict<EmploymentStatus>([
    ['employed', 'Работает'],
    ['selfEmployed', 'Самозанятый'],
    ['pensioner', 'Пенсионер'],
    ['student', 'Студент'],
    ['maternityLeave', 'В декрете'],
    ['unemployed', 'Не работает'],
  ]),
  govServicesAccount: dict<GovServicesAccount>([
    ['confirmed', 'Подтверждена'],
    ['notConfirmed', 'Не подтверждена'],
    ['none', 'Нет'],
  ]),
  receiptDelivery: dict<ReceiptDelivery>([
    ['paper', 'Бумажная'],
    ['electronic', 'Электронная'],
    ['both', 'Обе'],
  ]),
  consentConfirmation: dict<ConsentConfirmation>([
    ['govServices', 'Госуслуги'],
    ['paper', 'Бумага'],
    ['eSignature', 'Электронная подпись'],
  ]),
  citizenTag: dict<CitizenTag>([
    ['needsInPersonVisit', 'Требует личного приёма'],
    ['veteran', 'Ветеран'],
    ['largeFamily', 'Многодетная семья'],
  ]),
  reviewReason: dict<ReviewReason>([
    ['incompleteDocuments', 'Неполные документы'],
    ['dataMismatch', 'Расхождение данных'],
    ['possibleDuplicate', 'Возможный дубль'],
    ['documentExpired', 'Истёк документ'],
  ]),
  archiveReason: dict<ArchiveReason>([
    ['deceased', 'Умер'],
    ['leftRegion', 'Выбыл из региона'],
    ['byRequest', 'По заявлению'],
    ['mergedWithDuplicate', 'Объединена с дубликатом'],
    ['inputError', 'Ошибка ввода'],
  ]),
  cardSource: dict<CardSource>([
    ['govServices', 'Госуслуги'],
    ['personalAccount', 'Личный кабинет'],
    ['clientCenter', 'Клиентский центр (личный приём)'],
    ['post', 'Почта'],
    ['callCenter', 'Колл-центр'],
    ['integration1c', 'Интеграция с 1С'],
    ['legacyMigration', 'Перенос из прежней системы'],
  ]),
  addressType: dict<AddressType>([
    ['registration', 'Регистрации'],
    ['residence', 'Проживания'],
    ['mailing', 'Почтовый'],
  ]),
  contractStatus: dict<ContractStatus>([
    ['active', 'Действует'],
    ['notConcluded', 'Не заключён'],
    ['terminated', 'Расторгнут'],
  ]),
  conclusionMethod: dict<ConclusionMethod>([
    ['govServices', 'Госуслуги'],
    ['office', 'Офис'],
    ['online', 'Онлайн'],
  ]),
  familyRelation: dict<FamilyRelation>([
    ['spouse', 'Супруг(а)'],
    ['child', 'Ребёнок'],
    ['parent', 'Родитель'],
    ['sibling', 'Брат / сестра'],
    ['other', 'Иной'],
  ]),
  familyResidence: dict<FamilyResidence>([
    ['permanent', 'Постоянно'],
    ['temporarilyAbsent', 'Временно отсутствует'],
  ]),
  familyCategory: dict<FamilyCategory>([
    ['preschooler', 'Дошкольник'],
    ['schoolchild', 'Школьник'],
    ['student', 'Студент'],
    ['working', 'Работающий'],
    ['pensioner', 'Пенсионер'],
  ]),
  district: numbered('d', DISTRICT_LABELS),
  region: [
    { value: 'novgorod', label: 'Новгородская область' },
    { value: 'spb', label: 'Санкт-Петербург' },
    { value: 'lenobl', label: 'Ленинградская область' },
    { value: 'pskov', label: 'Псковская область' },
    { value: 'tver', label: 'Тверская область' },
    { value: 'moscow', label: 'Москва' },
  ],
  responsible: numbered('r', RESPONSIBLE_LABELS),
  maritalStatus: [
    { value: 'single', label: 'Не женат / не замужем' },
    { value: 'married', label: 'Женат / замужем' },
    { value: 'divorced', label: 'Разведён(а)' },
    { value: 'widowed', label: 'Вдовец / вдова' },
    { value: 'civil', label: 'Гражданский брак' },
  ],
  citizenship: [
    { value: 'ru', label: 'Россия' },
    { value: 'by', label: 'Беларусь' },
    { value: 'kz', label: 'Казахстан' },
    { value: 'am', label: 'Армения' },
    { value: 'uz', label: 'Узбекистан' },
    { value: 'kg', label: 'Киргизия' },
    { value: 'tj', label: 'Таджикистан' },
    { value: 'az', label: 'Азербайджан' },
    { value: 'md', label: 'Молдова' },
    { value: 'ua', label: 'Украина' },
    { value: 'stateless', label: 'Без гражданства' },
  ],
  language: [
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'Английский' },
    { value: 'hy', label: 'Армянский' },
    { value: 'uz', label: 'Узбекский' },
    { value: 'tg', label: 'Таджикский' },
    { value: 'tt', label: 'Татарский' },
    { value: 'az', label: 'Азербайджанский' },
    { value: 'other', label: 'Другой' },
  ],
};

export function codesOf(key: keyof Dictionaries): readonly DictValue[] {
  return DICTIONARIES[key].map((item) => item.value);
}

export function labelOf(key: keyof Dictionaries, value: DictValue | null): string {
  return DICTIONARIES[key].find((item) => item.value === value)?.label ?? '';
}

export const districtLabel = (code: DictValue): string => labelOf('district', code);
