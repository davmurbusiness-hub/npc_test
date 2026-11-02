import type { DictValue, IsoDate, CitizenId, RowId } from 'types/common';
import type { BenefitKind, DictionaryItem, Gender, ExpiryKind } from 'types/dictionaries';
import type {
  Address,
  Benefit,
  BenefitCategory,
  CitizenCard,
  CitizenStored,
  RelatedTables,
  CitizenEditable,
  CitizenSectionKey,
  RelatedTableKey,
  SectionKey,
} from 'types/entities';
import type { DraftRow, FieldIssue } from 'types/form';
import type { BenefitBrief, CitizenRow } from 'types/registry';
import type { EditableRowMap } from 'types/storage';
import { round2 } from 'utils/format';
import { ageInYears, isoToDays, periodIndex, periodIndexOfDays } from 'utils/isoDate';

export function pensionAge(gender: Gender): number {
  return gender === 'male' ? 60 : 55;
}

export function isActiveBenefit(
  benefit: Pick<Benefit, 'verification' | 'validFrom' | 'validTo'>,
  todayIso: IsoDate
): boolean {
  return (
    benefit.verification === 'confirmed' &&
    (benefit.validFrom === null || benefit.validFrom <= todayIso) &&
    (benefit.validTo === null || benefit.validTo >= todayIso)
  );
}

export const BENEFIT_ORDER: readonly BenefitKind[] = [
  'disabled',
  'combatVeteran',
  'laborVeteran',
  'largeFamily',
  'lowIncome',
  'pensioner',
];

export function benefitCategoryOf(
  benefits: readonly Benefit[],
  todayIso: IsoDate
): BenefitCategory | null {
  const active = benefits
    .filter((benefit) => isActiveBenefit(benefit, todayIso))
    .sort(
      (a, b) =>
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0) ||
        BENEFIT_ORDER.indexOf(a.kind) - BENEFIT_ORDER.indexOf(b.kind)
    );
  const first = active[0];
  if (first === undefined) return null;
  return { kind: first.kind, extra: new Set(active.map((benefit) => benefit.kind)).size - 1 };
}

export const HOME_REGION = 'novgorod';

export function districtOf(
  addresses: readonly Address[],
  districts: readonly DictionaryItem[]
): DictValue | null {
  const address =
    addresses.find((item) => item.isPrimary && item.type === 'residence') ??
    addresses.find((item) => item.isPrimary && item.type === 'registration');
  if (address === undefined || address.region !== HOME_REGION) return null;
  return districts.find((item) => item.label === address.district)?.value ?? null;
}

export interface CardContext {
  todayIso: IsoDate;
  districts: readonly DictionaryItem[];
}

export type RelatedSource = Omit<RelatedTables, 'objects'> & {
  objects: EditableRowMap['objects'][];
};

export function buildCard(
  citizen: CitizenStored,
  related: RelatedSource,
  { todayIso, districts }: CardContext
): CitizenCard {
  const objects = related.objects.map((object) => ({
    ...object,
    debt: round2(
      related.payments.reduce(
        (sum, payment) => (payment.objectId === object.id ? sum + payment.debt : sum),
        0
      )
    ),
  }));

  return {
    citizen: {
      ...citizen,
      age: ageInYears(isoToDays(citizen.birthDate), isoToDays(todayIso)),
      dependentsCount: related.familyMembers.filter((member) => member.isDependent).length,
      districtId: districtOf(related.addresses, districts),
      benefitCategory: benefitCategoryOf(related.benefits, todayIso),
      debt: round2(objects.reduce((sum, object) => sum + object.debt, 0)),
    },
    related: { ...related, objects },
  };
}

const EMPTY_EXPIRES: Record<ExpiryKind, IsoDate | null> = {
  document: null,
  benefit: null,
  powerOfAttorney: null,
  consent: null,
};
const EMPTY_BRIEFS: BenefitBrief[] = [];

const pool = new Map<string, readonly string[]>();

function shared<T extends string>(items: readonly T[]): T[] {
  const key = items.join('|');
  let found = pool.get(key);
  if (found === undefined) {
    found = items.slice();
    pool.set(key, found);
  }
  return found as T[];
}

const earliest = (dates: readonly (IsoDate | null)[]): IsoDate | null =>
  dates.reduce<IsoDate | null>(
    (min, date) => (date !== null && (min === null || date < min) ? date : min),
    null
  );

export function toRow(card: CitizenCard, todayIso: IsoDate): CitizenRow {
  const { citizen, related } = card;
  const lastClosedIndex = periodIndexOfDays(isoToDays(todayIso)) - 1;
  const fullName = [citizen.lastName, citizen.firstName, citizen.middleName]
    .filter((part) => part !== null)
    .join(' ');

  let oldestUnpaid: string | null = null;
  for (const payment of related.payments) {
    if (payment.debt > 0 && (oldestUnpaid === null || payment.period < oldestUnpaid)) {
      oldestUnpaid = payment.period;
    }
  }

  const totalTariff = related.objects.reduce((sum, object) => sum + (object.tariff ?? 0), 0);
  const benefits: BenefitBrief[] = related.benefits.map((benefit) => ({
    kind: benefit.kind,
    verification: benefit.verification ?? 'onReview',
    monthlyDiscount: isActiveBenefit(benefit, todayIso)
      ? round2((totalTariff * (benefit.discountPercent ?? 0)) / 100)
      : 0,
  }));

  const expiresAt: Record<ExpiryKind, IsoDate | null> = {
    document: citizen.documentValidUntil,
    benefit: earliest(
      related.benefits
        .filter((benefit) => benefit.verification === 'confirmed')
        .map((benefit) => benefit.validTo)
    ),
    powerOfAttorney: earliest(
      related.representatives
        .filter((representative) => representative.status === 'active')
        .map((representative) => representative.validUntil)
    ),
    consent: citizen.pdConsent ? citizen.pdConsentUntil : null,
  };
  const hasExpiry = Object.values(expiresAt).some((date) => date !== null);

  const lastNotification = related.notifications.reduce<
    (typeof related.notifications)[number] | null
  >((last, item) => (last === null || item.sentAt > last.sentAt ? item : last), null);

  return {
    id: citizen.id,
    cardNumber: citizen.cardNumber,
    fullName,
    birthDate: citizen.birthDate,
    age: citizen.age,
    mobilePhone: citizen.mobilePhone,
    districtId: citizen.districtId,
    status: citizen.status,
    benefitCategory: citizen.benefitCategory,
    debt: citizen.debt,
    responsibleId: citizen.responsibleId,
    updatedAt: citizen.updatedAt,

    searchName: fullName.toLowerCase(),
    snils: citizen.snils,
    accountNumbers: related.objects.slice(0, 3).map((object) => object.accountNumber),

    gender: citizen.gender,
    objectTypes: shared([...new Set(related.objects.map((object) => object.type))]),
    tags: shared(citizen.tags),
    contactChannel: citizen.contactChannel,
    specialNeeds: shared(citizen.specialNeeds),

    debtAgeMonths: oldestUnpaid === null ? null : lastClosedIndex - periodIndex(oldestUnpaid),
    lastContactAt: citizen.lastContactAt,
    statusChangedAt: citizen.statusChangedAt,
    reviewReason: citizen.reviewReason,
    expiresAt: hasExpiry ? expiresAt : EMPTY_EXPIRES,
    hasValidConsent:
      citizen.pdConsent && (citizen.pdConsentUntil === null || citizen.pdConsentUntil >= todayIso),
    hasContact: citizen.mobilePhone !== null || citizen.email !== null,
    lastNotificationFailed: lastNotification?.deliveryStatus === 'error',
    benefits: benefits.length === 0 ? EMPTY_BRIEFS : benefits,
  };
}

export function addressText(row: DraftRow<'addresses'>): string {
  return [
    row.city,
    row.street,
    row.house === null ? null : `д. ${row.house}`,
    row.building === null ? null : `корп. ${row.building}`,
    row.apartment === null ? null : `кв. ${row.apartment}`,
  ]
    .filter((part) => part !== null && part !== '')
    .join(', ');
}

export function objectText(row: DraftRow<'objects'>): string {
  return row.accountNumber === null ? 'Объект без № ЛС' : `ЛС ${row.accountNumber}`;
}

export const CITIZEN_SECTIONS: readonly CitizenSectionKey[] = [
  'main',
  'contacts',
  'documents',
  'social',
  'digital',
  'consents',
  'service',
  'computed',
];

export const RELATED_SECTIONS: readonly RelatedTableKey[] = [
  'addresses',
  'objects',
  'contracts',
  'familyMembers',
  'education',
  'employment',
  'benefits',
  'representatives',
  'payments',
  'notifications',
  'attachments',
];

export const SECTION_LABELS: Readonly<Record<SectionKey, string>> = {
  main: 'Основные',
  contacts: 'Контакты',
  documents: 'Документы',
  social: 'Соц. профиль',
  digital: 'Цифровой профиль',
  consents: 'Согласия',
  service: 'Служебные',
  computed: 'Вычисляемые',
  addresses: 'Адреса',
  objects: 'Объекты и ЛС',
  contracts: 'Договоры',
  familyMembers: 'Члены семьи',
  education: 'Образование',
  employment: 'Занятость',
  benefits: 'Льготы',
  representatives: 'Представители',
  payments: 'Платежи',
  notifications: 'Уведомления',
  attachments: 'Вложения',
};

export const DEFAULT_SECTION: SectionKey = 'main';

export function isSectionKey(value: string | undefined): value is SectionKey {
  return value !== undefined && Object.hasOwn(SECTION_LABELS, value);
}

export const CITIZEN_FIELD_SECTION: Readonly<Record<keyof CitizenEditable, CitizenSectionKey>> = {
  lastName: 'main',
  firstName: 'main',
  middleName: 'main',
  previousLastName: 'main',
  gender: 'main',
  birthDate: 'main',
  birthPlace: 'main',
  citizenship: 'main',
  status: 'main',

  mobilePhone: 'contacts',
  extraPhone: 'contacts',
  email: 'contacts',
  messenger: 'contacts',
  contactChannel: 'contacts',
  convenientTime: 'contacts',
  language: 'contacts',
  specialNeeds: 'contacts',

  documentType: 'documents',
  documentSeries: 'documents',
  documentNumber: 'documents',
  documentIssuedBy: 'documents',
  documentIssuedAt: 'documents',
  documentDepartmentCode: 'documents',
  documentValidUntil: 'documents',
  snils: 'documents',
  inn: 'documents',

  maritalStatus: 'social',
  employmentStatus: 'social',
  disabilityGroup: 'social',

  govServicesAccount: 'digital',
  hasPersonalAccount: 'digital',
  personalAccountRegisteredAt: 'digital',
  receiptDelivery: 'digital',
  autopay: 'digital',
  eSignature: 'digital',

  pdConsent: 'consents',
  pdConsentDate: 'consents',
  pdConsentUntil: 'consents',
  smsConsent: 'consents',
  emailConsent: 'consents',
  surveyConsent: 'consents',
  consentConfirmation: 'consents',

  responsibleId: 'service',
  source: 'service',
  tags: 'service',
  lastContactAt: 'service',
  internalNote: 'service',
  statusChangedAt: 'service',
  reviewReason: 'service',
  originalCardId: 'service',
  archiveReason: 'service',
};

export function sectionOf(issue: FieldIssue): SectionKey {
  if (issue.table !== 'citizens') return issue.table;
  return Object.hasOwn(CITIZEN_FIELD_SECTION, issue.field)
    ? CITIZEN_FIELD_SECTION[issue.field as keyof CitizenEditable]
    : DEFAULT_SECTION;
}

export const SECTION_ORDER: readonly SectionKey[] = [...CITIZEN_SECTIONS, ...RELATED_SECTIONS];

export const ROW_PREFIX: Readonly<Record<RelatedTableKey, string>> = {
  addresses: 'a',
  objects: 'o',
  contracts: 'c',
  familyMembers: 'f',
  education: 'e',
  employment: 'w',
  benefits: 'b',
  representatives: 'r',
  payments: 'p',
  notifications: 'n',
  attachments: 't',
};

export function rowId(citizenId: CitizenId, table: RelatedTableKey, n: number): RowId {
  return `${citizenId}-${ROW_PREFIX[table]}${n}`;
}

const USER_ROW = /^\d+-[a-z]u(\d+)$/;

export function isUserRowId(id: RowId): boolean {
  return USER_ROW.test(id);
}

export function newRowId(
  citizenId: CitizenId,
  table: RelatedTableKey,
  takenIds: Iterable<RowId>
): RowId {
  const prefix = `${citizenId}-${ROW_PREFIX[table]}u`;
  let max = 0;
  for (const id of takenIds) {
    if (!id.startsWith(prefix)) continue;
    const match = USER_ROW.exec(id);
    if (match !== null) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}${max + 1}`;
}
