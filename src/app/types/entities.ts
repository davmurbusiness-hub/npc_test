import type { CitizenId, DictValue, IsoDate, IsoDateTime, RowId } from './common';
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
} from './dictionaries';

export interface CitizenStored {
  id: CitizenId;

  cardNumber: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  previousLastName: string | null;
  gender: Gender;
  birthDate: IsoDate;
  birthPlace: string | null;
  citizenship: DictValue;
  status: CardStatus;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;

  mobilePhone: string | null;
  extraPhone: string | null;
  email: string | null;
  messenger: Messenger;
  contactChannel: ContactChannel;
  convenientTime: ConvenientTime | null;
  language: DictValue;
  specialNeeds: SpecialNeed[];

  documentType: DocumentType;
  documentSeries: string;
  documentNumber: string;
  documentIssuedBy: string | null;
  documentIssuedAt: IsoDate;
  documentDepartmentCode: string | null;
  documentValidUntil: IsoDate | null;
  snils: string;
  inn: string | null;

  maritalStatus: DictValue;
  employmentStatus: EmploymentStatus;
  disabilityGroup: DisabilityGroup;

  govServicesAccount: GovServicesAccount;
  hasPersonalAccount: boolean;
  personalAccountRegisteredAt: IsoDate | null;
  receiptDelivery: ReceiptDelivery;
  autopay: boolean;
  eSignature: boolean;

  pdConsent: boolean;
  pdConsentDate: IsoDate | null;
  pdConsentUntil: IsoDate | null;
  smsConsent: boolean;
  emailConsent: boolean;
  surveyConsent: boolean;
  consentConfirmation: ConsentConfirmation | null;

  responsibleId: DictValue;
  source: CardSource;
  tags: CitizenTag[];
  lastContactAt: IsoDate | null;
  internalNote: string | null;
  statusChangedAt: IsoDate;
  reviewReason: ReviewReason | null;
  originalCardId: CitizenId | null;
  archiveReason: ArchiveReason | null;
}

export interface CitizenComputed {
  age: number;
  dependentsCount: number;
  districtId: DictValue | null;
}

export type Citizen = CitizenStored & CitizenComputed;

export type CitizenEditable = Omit<CitizenStored, 'id' | 'cardNumber' | 'createdAt' | 'updatedAt'>;

export interface RelatedBase {
  id: RowId;
  citizenId: CitizenId;
}

export interface Address extends RelatedBase {
  type: AddressType;
  isPrimary: boolean;
  region: DictValue;
  district: string | null;
  city: string;
  street: string;
  house: string;
  building: string | null;
  apartment: string | null;
  postalCode: string | null;
  validFrom: IsoDate | null;
  validTo: IsoDate | null;
}

export interface Contract extends RelatedBase {
  contractNumber: string;
  concludedAt: IsoDate;
  validUntil: IsoDate | null;
  status: ContractStatus;
  conclusionMethod: ConclusionMethod | null;
  terminatedAt: IsoDate | null;
  terminationReason: string | null;
}

export interface FamilyMember extends RelatedBase {
  fullName: string;
  relation: FamilyRelation;
  birthDate: IsoDate;
  gender: Gender | null;
  residence: FamilyResidence | null;
  registeredFrom: IsoDate | null;
  category: FamilyCategory | null;
  documentNumber: string | null;
  snils: string | null;
  studyOrWorkPlace: string | null;
  isDependent: boolean;
}

export interface RelatedRowMap {
  addresses: Address;
  contracts: Contract;
  familyMembers: FamilyMember;
}

export type RelatedTableKey = keyof RelatedRowMap;

export type RelatedTables = { [K in RelatedTableKey]: RelatedRowMap[K][] };

export interface CitizenCard {
  citizen: Citizen;
  related: RelatedTables;
}

export interface CitizenPreview {
  citizen: Pick<
    Citizen,
    | 'id'
    | 'cardNumber'
    | 'lastName'
    | 'firstName'
    | 'middleName'
    | 'birthDate'
    | 'age'
    | 'gender'
    | 'mobilePhone'
    | 'email'
    | 'status'
    | 'districtId'
    | 'responsibleId'
  >;
  addresses: Address[];
}

export type CitizenSectionKey =
  'main' | 'contacts' | 'documents' | 'social' | 'digital' | 'consents' | 'service' | 'computed';

export type TableKey = 'citizens' | RelatedTableKey;

export type SectionKey = CitizenSectionKey | RelatedTableKey;
