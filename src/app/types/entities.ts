import type {
  CitizenId,
  DictValue,
  FileRef,
  IsoDate,
  IsoDateTime,
  Percent,
  RowId,
  Rubles,
  YearMonth,
} from './common';
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

export interface BenefitCategory {
  kind: BenefitKind;
  extra: number;
}

export interface CitizenComputed {
  age: number;
  dependentsCount: number;
  districtId: DictValue | null;
  benefitCategory: BenefitCategory | null;
  debt: Rubles;
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

export interface PropertyObject extends RelatedBase {
  accountNumber: string;
  type: ObjectType;
  addressId: RowId;
  cadastralNumber: string | null;
  area: number;
  rightType: RightType;
  share: Percent | null;
  residentsCount: number;
  wasteAccumulation: WasteAccumulation | null;
  containerSiteNumber: string | null;
  pickupSchedule: Weekday[];
  tariff: Rubles | null;
  billingStartDate: IsoDate | null;
  debt: Rubles;
}

export interface Contract extends RelatedBase {
  contractNumber: string;
  objectId: RowId;
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
  objectId: RowId | null;
}

export interface Education extends RelatedBase {
  level: EducationLevel;
  institution: DictValue;
  specialty: DictValue | null;
  studyForm: StudyForm | null;
  admissionYear: number | null;
  graduationYear: number | null;
  documentSeries: string | null;
  documentNumber: string | null;
  status: EducationStatus | null;
}

export interface Employment extends RelatedBase {
  organization: DictValue;
  position: DictValue | null;
  type: EmploymentType;
  from: IsoDate;
  to: IsoDate | null;
  isCurrent: boolean;
  income: Rubles | null;
}

export interface Benefit extends RelatedBase {
  kind: BenefitKind;
  beneficiary: BenefitBeneficiary;
  familyMemberId: RowId | null;
  basisDocument: string;
  number: string | null;
  issuedAt: IsoDate;
  issuedBy: string | null;
  validFrom: IsoDate | null;
  validTo: IsoDate | null;
  discountPercent: Percent | null;
  verification: BenefitVerification | null;
  rejectionReason: string | null;
}

export interface Representative extends RelatedBase {
  fullName: string;
  type: RepresentativeType;
  powerOfAttorneyNumber: string | null;
  issuedAt: IsoDate | null;
  validUntil: IsoDate;
  powers: RepresentativePower[];
  contact: string | null;
  documentSeriesNumber: string | null;
  status: RepresentativeStatus | null;
}

export interface Payment extends RelatedBase {
  objectId: RowId;
  period: YearMonth;
  charged: Rubles;
  discount: Rubles;
  penalty: Rubles;
  paid: Rubles;
  paidAt: IsoDate | null;
  method: PaymentMethod | null;
  documentNumber: string | null;
  toPay: Rubles;
  debt: Rubles;
  status: PaymentStatus;
}

export interface CitizenNotification extends RelatedBase {
  sentAt: IsoDateTime;
  channel: NotificationChannel;
  type: NotificationType;
  deliveryStatus: DeliveryStatus;
  errorReason: DeliveryError | null;
}

export interface Attachment extends RelatedBase {
  title: string;
  type: AttachmentType;
  target: AttachmentTarget;
  targetId: RowId | null;
  file: FileRef;
  uploadedAt: IsoDateTime;
  uploadedBy: DictValue;
  comment: string | null;
}

export interface RelatedRowMap {
  addresses: Address;
  objects: PropertyObject;
  contracts: Contract;
  familyMembers: FamilyMember;
  education: Education;
  employment: Employment;
  benefits: Benefit;
  representatives: Representative;
  payments: Payment;
  notifications: CitizenNotification;
  attachments: Attachment;
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
    | 'benefitCategory'
    | 'debt'
    | 'responsibleId'
  >;
  benefits: Benefit[];
  objects: PropertyObject[];
}

export type CitizenSectionKey =
  'main' | 'contacts' | 'documents' | 'social' | 'digital' | 'consents' | 'service' | 'computed';

export type TableKey = 'citizens' | RelatedTableKey;

export type SectionKey = CitizenSectionKey | RelatedTableKey;
