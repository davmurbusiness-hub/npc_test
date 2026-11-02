import type { DictValue, IsoDate, CitizenId, RowId } from 'types/common';
import type { DictionaryItem, ExpiryKind, Gender } from 'types/dictionaries';
import type {
  Address,
  CitizenCard,
  CitizenStored,
  RelatedTables,
  CitizenEditable,
  CitizenSectionKey,
  RelatedTableKey,
  SectionKey,
} from 'types/entities';
import type { DraftRow, FieldIssue } from 'types/form';
import type { CitizenRow } from 'types/registry';
import { ageInYears, isoToDays } from 'utils/isoDate';

export function pensionAge(gender: Gender): number {
  return gender === 'male' ? 60 : 55;
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

export function buildCard(
  citizen: CitizenStored,
  related: RelatedTables,
  { todayIso, districts }: CardContext
): CitizenCard {
  return {
    citizen: {
      ...citizen,
      age: ageInYears(isoToDays(citizen.birthDate), isoToDays(todayIso)),
      dependentsCount: related.familyMembers.filter((member) => member.isDependent).length,
      districtId: districtOf(related.addresses, districts),
    },
    related,
  };
}

const EMPTY_EXPIRES: Record<ExpiryKind, IsoDate | null> = {
  document: null,
  consent: null,
};

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

export function toRow(card: CitizenCard, todayIso: IsoDate): CitizenRow {
  const { citizen } = card;
  const fullName = [citizen.lastName, citizen.firstName, citizen.middleName]
    .filter((part) => part !== null)
    .join(' ');

  const expiresAt: Record<ExpiryKind, IsoDate | null> = {
    document: citizen.documentValidUntil,
    consent: citizen.pdConsent ? citizen.pdConsentUntil : null,
  };
  const hasExpiry = Object.values(expiresAt).some((date) => date !== null);

  return {
    id: citizen.id,
    cardNumber: citizen.cardNumber,
    fullName,
    birthDate: citizen.birthDate,
    age: citizen.age,
    mobilePhone: citizen.mobilePhone,
    districtId: citizen.districtId,
    status: citizen.status,
    responsibleId: citizen.responsibleId,
    updatedAt: citizen.updatedAt,

    searchName: fullName.toLowerCase(),
    snils: citizen.snils,

    gender: citizen.gender,
    tags: shared(citizen.tags),
    contactChannel: citizen.contactChannel,
    specialNeeds: shared(citizen.specialNeeds),

    lastContactAt: citizen.lastContactAt,
    statusChangedAt: citizen.statusChangedAt,
    reviewReason: citizen.reviewReason,
    expiresAt: hasExpiry ? expiresAt : EMPTY_EXPIRES,
    hasValidConsent:
      citizen.pdConsent && (citizen.pdConsentUntil === null || citizen.pdConsentUntil >= todayIso),
    hasContact: citizen.mobilePhone !== null || citizen.email !== null,
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
  'contracts',
  'familyMembers',
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
  contracts: 'Договоры',
  familyMembers: 'Члены семьи',
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
  contracts: 'c',
  familyMembers: 'f',
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
