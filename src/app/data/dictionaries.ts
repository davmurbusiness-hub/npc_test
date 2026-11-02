import type { DictValue } from 'types/common';
import type {
  AddressType,
  ArchiveReason,
  AttachmentTarget,
  AttachmentType,
  BenefitBeneficiary,
  BenefitKind,
  BenefitVerification,
  CardSource,
  CardStatus,
  CitizenTag,
  ConclusionMethod,
  ConsentConfirmation,
  ContactChannel,
  ContractStatus,
  ConvenientTime,
  DeliveryError,
  DeliveryStatus,
  Dictionaries,
  DictionaryItem,
  DisabilityGroup,
  DocumentType,
  EducationLevel,
  EducationStatus,
  EmploymentStatus,
  EmploymentType,
  FamilyCategory,
  FamilyRelation,
  FamilyResidence,
  Gender,
  GovServicesAccount,
  Messenger,
  NotificationChannel,
  NotificationType,
  ObjectType,
  PaymentMethod,
  PaymentStatus,
  ReceiptDelivery,
  RepresentativePower,
  RepresentativeStatus,
  RepresentativeType,
  ReviewReason,
  RightType,
  SpecialNeed,
  StudyForm,
  WasteAccumulation,
  Weekday,
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

type InstitutionGroup = 'school' | 'vocational' | 'higher';

const INSTITUTION_ROWS: readonly (readonly [label: string, group: InstitutionGroup])[] = [
  ['Новгородский государственный университет', 'higher'],
  ['Новгородский политехнический институт', 'higher'],
  ['Санкт-Петербургский государственный университет', 'higher'],
  ['Московский государственный университет', 'higher'],
  ['Педагогический колледж', 'vocational'],
  ['Медицинский колледж', 'vocational'],
  ['Аграрный техникум', 'vocational'],
  ['Строительный техникум', 'vocational'],
  ['Энергетический техникум', 'vocational'],
  ['Торгово-экономический колледж', 'vocational'],
  ['Автотранспортный техникум', 'vocational'],
  ['Колледж искусств', 'vocational'],
  ['Школа № 1', 'school'],
  ['Школа № 2', 'school'],
  ['Школа № 5', 'school'],
  ['Школа № 8', 'school'],
  ['Школа № 12', 'school'],
  ['Школа № 19', 'school'],
  ['Лицей № 3', 'school'],
  ['Гимназия № 4', 'school'],
];

const institutionCodes = (group: InstitutionGroup): readonly DictValue[] =>
  INSTITUTION_ROWS.flatMap(([, rowGroup], i) => (rowGroup === group ? [codeOf('i', i)] : []));

export const INSTITUTION_CODES: Readonly<Record<InstitutionGroup, readonly DictValue[]>> = {
  school: institutionCodes('school'),
  vocational: institutionCodes('vocational'),
  higher: institutionCodes('higher'),
};

const ORGANIZATION_ROWS: readonly (readonly [label: string, entrepreneur: boolean])[] = [
  ['ООО «Вектор»', false],
  ['ООО «Север-Строй»', false],
  ['ООО «Альфа-Сервис»', false],
  ['ООО «Ладога»', false],
  ['ООО «Торговый дом Новгород»', false],
  ['ООО «Строймонтаж»', false],
  ['ООО «АгроСоюз»', false],
  ['ООО «Логистик-Плюс»', false],
  ['ООО «Мебельная фабрика»', false],
  ['ООО «Типография Ильмень»', false],
  ['ООО «ТехноСервис»', false],
  ['ООО «ЖилКомфорт»', false],
  ['ООО «Новгородская торговая компания»', false],
  ['АО «Волховский машиностроительный завод»', false],
  ['АО «Ильмень-Пром»', false],
  ['АО «Северная энергия»', false],
  ['АО «Хлебозавод»', false],
  ['АО «Новгородские молочные продукты»', false],
  ['МУП «Городской водоканал»', false],
  ['МУП «Городские электросети»', false],
  ['МУП «Благоустройство»', false],
  ['МУП «Пассажирский транспорт»', false],
  ['ГБУ «Областная больница»', false],
  ['ГБУ «Городская поликлиника № 1»', false],
  ['ГБУ «Центр социальной защиты»', false],
  ['ГБУ «Дом культуры»', false],
  ['ИП Смирнов А. В.', true],
  ['ИП Кузнецова Е. П.', true],
  ['ИП Орлов Д. С.', true],
  ['ИП Васильева Н. А.', true],
];

const organizationCodes = (entrepreneur: boolean): readonly DictValue[] =>
  ORGANIZATION_ROWS.flatMap(([, isEntrepreneur], i) =>
    isEntrepreneur === entrepreneur ? [codeOf('o', i)] : []
  );

export const ORGANIZATION_CODES = {
  company: organizationCodes(false),
  entrepreneur: organizationCodes(true),
} as const;

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
  objectType: dict<ObjectType>([
    ['apartmentBuilding', 'МКД'],
    ['privateHouse', 'ИЖС'],
    ['gardenHouse', 'Садовый дом'],
    ['nonResidential', 'Нежилое'],
  ]),
  rightType: dict<RightType>([
    ['ownership', 'Собственность'],
    ['socialRent', 'Социальный найм'],
    ['lease', 'Аренда'],
  ]),
  wasteAccumulation: dict<WasteAccumulation>([
    ['containerSite', 'Контейнерная площадка'],
    ['bunker', 'Бункер'],
    ['chute', 'Мусоропровод'],
    ['bags', 'Мешки'],
  ]),
  weekday: dict<Weekday>([
    ['mon', 'Пн'],
    ['tue', 'Вт'],
    ['wed', 'Ср'],
    ['thu', 'Чт'],
    ['fri', 'Пт'],
    ['sat', 'Сб'],
    ['sun', 'Вс'],
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
  educationLevel: dict<EducationLevel>([
    ['secondary', 'Среднее'],
    ['vocational', 'СПО'],
    ['bachelor', 'Бакалавриат'],
    ['specialist', 'Специалитет'],
    ['master', 'Магистратура'],
    ['postgraduate', 'Аспирантура'],
  ]),
  studyForm: dict<StudyForm>([
    ['fullTime', 'Очная'],
    ['partTime', 'Очно-заочная'],
    ['extramural', 'Заочная'],
  ]),
  educationStatus: dict<EducationStatus>([
    ['graduated', 'Окончил'],
    ['studying', 'Учится'],
    ['notGraduated', 'Не окончил'],
  ]),
  employmentType: dict<EmploymentType>([
    ['hired', 'По найму'],
    ['selfEmployed', 'Самозанятый'],
    ['individualEntrepreneur', 'ИП'],
  ]),
  benefitKind: dict<BenefitKind>([
    ['laborVeteran', 'Ветеран труда'],
    ['largeFamily', 'Многодетная семья'],
    ['disabled', 'Инвалид'],
    ['pensioner', 'Пенсионер'],
    ['lowIncome', 'Малоимущая семья'],
    ['combatVeteran', 'Ветеран БД'],
  ]),
  benefitBeneficiary: dict<BenefitBeneficiary>([
    ['applicant', 'Заявитель'],
    ['familyMember', 'Член семьи'],
  ]),
  benefitVerification: dict<BenefitVerification>([
    ['confirmed', 'Подтверждена'],
    ['onReview', 'На проверке'],
    ['expired', 'Истекла'],
    ['rejected', 'Отказ'],
  ]),
  representativeType: dict<RepresentativeType>([
    ['powerOfAttorney', 'Доверенность'],
    ['guardian', 'Опекун'],
    ['legalRepresentative', 'Законный представитель'],
  ]),
  representativePower: dict<RepresentativePower>([
    ['contracts', 'Заключение договоров'],
    ['payments', 'Платежи'],
    ['documents', 'Документы'],
    ['correspondence', 'Переписка'],
    ['fullRepresentation', 'Полное представительство'],
  ]),
  representativeStatus: dict<RepresentativeStatus>([
    ['active', 'Действует'],
    ['expired', 'Истекла'],
    ['revoked', 'Отозвана'],
  ]),
  paymentMethod: dict<PaymentMethod>([
    ['online', 'Онлайн'],
    ['bank', 'Банк'],
    ['cashDesk', 'Касса'],
    ['autopay', 'Автоплатёж'],
  ]),
  paymentStatus: dict<PaymentStatus>([
    ['paid', 'Оплачено'],
    ['partial', 'Частично'],
    ['debt', 'Долг'],
  ]),
  notificationChannel: dict<NotificationChannel>([
    ['sms', 'СМС'],
    ['email', 'Email'],
    ['post', 'Почта'],
    ['personalAccount', 'Личный кабинет'],
  ]),
  notificationType: dict<NotificationType>([
    ['receipt', 'Квитанция'],
    ['debtReminder', 'Напоминание о долге'],
    ['information', 'Информирование'],
  ]),
  deliveryStatus: dict<DeliveryStatus>([
    ['delivered', 'Доставлено'],
    ['error', 'Ошибка'],
    ['unread', 'Не прочитано'],
  ]),
  deliveryError: dict<DeliveryError>([
    ['numberUnavailable', 'Номер недоступен'],
    ['mailboxNotExists', 'Ящик не существует'],
    ['postReturn', 'Возврат почты'],
    ['accountNotOpened', 'ЛК не открыт'],
  ]),
  attachmentType: dict<AttachmentType>([
    ['passportScan', 'Скан паспорта'],
    ['egrnExtract', 'Выписка ЕГРН'],
    ['receipt', 'Квитанция'],
    ['certificate', 'Справка'],
    ['powerOfAttorney', 'Доверенность'],
  ]),
  attachmentTarget: dict<AttachmentTarget>([
    ['card', 'Карточка'],
    ['object', 'Объект'],
    ['benefit', 'Льгота'],
    ['representative', 'Представитель'],
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
  institution: numbered(
    'i',
    INSTITUTION_ROWS.map(([label]) => label)
  ),
  specialty: numbered('s', [
    'Экономика',
    'Юриспруденция',
    'Менеджмент',
    'Педагогика',
    'Строительство',
    'Электроэнергетика',
    'Программная инженерия',
    'Лечебное дело',
    'Бухгалтерский учёт',
    'Агрономия',
    'Повар',
    'Автомеханик',
    'Сестринское дело',
    'Информационные системы',
    'Машиностроение',
    'Психология',
    'Лингвистика',
    'Банковское дело',
    'Ветеринария',
    'Туризм',
    'Социальная работа',
    'Архитектура',
    'Химическая технология',
    'Дизайн',
    'Сварщик',
  ]),
  organization: numbered(
    'o',
    ORGANIZATION_ROWS.map(([label]) => label)
  ),
  position: numbered('p', [
    'Инженер',
    'Бухгалтер',
    'Водитель',
    'Продавец',
    'Учитель',
    'Медсестра',
    'Менеджер',
    'Оператор',
    'Слесарь',
    'Охранник',
    'Повар',
    'Уборщик',
    'Электрик',
    'Экономист',
    'Юрист',
    'Администратор',
    'Кладовщик',
    'Мастер смены',
    'Программист',
    'Врач',
    'Воспитатель',
    'Кассир',
    'Строитель',
    'Секретарь',
    'Диспетчер',
  ]),
};

export function codesOf(key: keyof Dictionaries): readonly DictValue[] {
  return DICTIONARIES[key].map((item) => item.value);
}

export function labelOf(key: keyof Dictionaries, value: DictValue | null): string {
  return DICTIONARIES[key].find((item) => item.value === value)?.label ?? '';
}

export const districtLabel = (code: DictValue): string => labelOf('district', code);
