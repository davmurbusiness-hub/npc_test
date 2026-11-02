import type { DictValue } from './common';

export type CardStatus = 'active' | 'review' | 'archived' | 'duplicate';
export type Gender = 'male' | 'female';
export type Messenger = 'telegram' | 'max' | 'whatsapp' | 'none';
export type ContactChannel = 'email' | 'sms' | 'post' | 'personalAccount' | 'inPerson';
export type ConvenientTime = 'morning' | 'day' | 'evening';
export type SpecialNeed = 'limitedMobility' | 'lowVision' | 'signLanguage' | 'none';
export type DocumentType = 'passportRf' | 'residencePermit' | 'foreignPassport' | 'militaryId';
export type DisabilityGroup = 'none' | 'I' | 'II' | 'III';
export type EmploymentStatus =
  'employed' | 'selfEmployed' | 'pensioner' | 'student' | 'maternityLeave' | 'unemployed';
export type GovServicesAccount = 'confirmed' | 'notConfirmed' | 'none';
export type ReceiptDelivery = 'paper' | 'electronic' | 'both';
export type ConsentConfirmation = 'govServices' | 'paper' | 'eSignature';
export type CitizenTag = 'needsInPersonVisit' | 'veteran' | 'largeFamily';
export type ReviewReason =
  'incompleteDocuments' | 'dataMismatch' | 'possibleDuplicate' | 'documentExpired';
export type ArchiveReason =
  'deceased' | 'leftRegion' | 'byRequest' | 'mergedWithDuplicate' | 'inputError';
export type CardSource =
  | 'govServices'
  | 'personalAccount'
  | 'clientCenter'
  | 'post'
  | 'callCenter'
  | 'integration1c'
  | 'legacyMigration';

export type AddressType = 'registration' | 'residence' | 'mailing';
export type ObjectType = 'apartmentBuilding' | 'privateHouse' | 'gardenHouse' | 'nonResidential';
export type RightType = 'ownership' | 'socialRent' | 'lease';
export type WasteAccumulation = 'containerSite' | 'bunker' | 'chute' | 'bags';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ContractStatus = 'active' | 'notConcluded' | 'terminated';
export type ConclusionMethod = 'govServices' | 'office' | 'online';
export type FamilyRelation = 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
export type FamilyResidence = 'permanent' | 'temporarilyAbsent';
export type FamilyCategory = 'preschooler' | 'schoolchild' | 'student' | 'working' | 'pensioner';
export type EducationLevel =
  'secondary' | 'vocational' | 'bachelor' | 'specialist' | 'master' | 'postgraduate';
export type StudyForm = 'fullTime' | 'partTime' | 'extramural';
export type EducationStatus = 'graduated' | 'studying' | 'notGraduated';
export type EmploymentType = 'hired' | 'selfEmployed' | 'individualEntrepreneur';
export type BenefitKind =
  'laborVeteran' | 'largeFamily' | 'disabled' | 'pensioner' | 'lowIncome' | 'combatVeteran';
export type BenefitBeneficiary = 'applicant' | 'familyMember';
export type BenefitVerification = 'confirmed' | 'onReview' | 'expired' | 'rejected';
export type RepresentativeType = 'powerOfAttorney' | 'guardian' | 'legalRepresentative';
export type RepresentativePower =
  'contracts' | 'payments' | 'documents' | 'correspondence' | 'fullRepresentation';
export type RepresentativeStatus = 'active' | 'expired' | 'revoked';
export type PaymentMethod = 'online' | 'bank' | 'cashDesk' | 'autopay';
export type PaymentStatus = 'paid' | 'partial' | 'debt';
export type NotificationChannel = 'sms' | 'email' | 'post' | 'personalAccount';
export type NotificationType = 'receipt' | 'debtReminder' | 'information';
export type DeliveryStatus = 'delivered' | 'error' | 'unread';
export type DeliveryError =
  'numberUnavailable' | 'mailboxNotExists' | 'postReturn' | 'accountNotOpened';
export type AttachmentType =
  'passportScan' | 'egrnExtract' | 'receipt' | 'certificate' | 'powerOfAttorney';
export type AttachmentTarget = 'card' | 'object' | 'benefit' | 'representative';

export type DictionaryKey =
  | 'cardStatus'
  | 'gender'
  | 'messenger'
  | 'contactChannel'
  | 'convenientTime'
  | 'specialNeed'
  | 'documentType'
  | 'disabilityGroup'
  | 'employmentStatus'
  | 'govServicesAccount'
  | 'receiptDelivery'
  | 'consentConfirmation'
  | 'citizenTag'
  | 'reviewReason'
  | 'archiveReason'
  | 'cardSource'
  | 'addressType'
  | 'objectType'
  | 'rightType'
  | 'wasteAccumulation'
  | 'weekday'
  | 'contractStatus'
  | 'conclusionMethod'
  | 'familyRelation'
  | 'familyResidence'
  | 'familyCategory'
  | 'educationLevel'
  | 'studyForm'
  | 'educationStatus'
  | 'employmentType'
  | 'benefitKind'
  | 'benefitBeneficiary'
  | 'benefitVerification'
  | 'representativeType'
  | 'representativePower'
  | 'representativeStatus'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'notificationChannel'
  | 'notificationType'
  | 'deliveryStatus'
  | 'deliveryError'
  | 'attachmentType'
  | 'attachmentTarget'
  | 'district'
  | 'region'
  | 'responsible'
  | 'maritalStatus'
  | 'citizenship'
  | 'language'
  | 'institution'
  | 'specialty'
  | 'organization'
  | 'position';

export interface DictionaryItem {
  value: DictValue;
  label: string;
}

export type Dictionaries = Readonly<Record<DictionaryKey, readonly DictionaryItem[]>>;

export type DebtAgeBucket = 'lt1m' | 'm1to3' | 'm3to6' | 'm6to12' | 'gt12';
export type ExpiryKind = 'document' | 'benefit' | 'powerOfAttorney' | 'consent';
export type DeadlineTone = 'none' | 'soon' | 'overdue';
export type PeriodMonths = 3 | 6 | 12;
export type SortDirection = 'asc' | 'desc';

export type StatusTransitions = Readonly<Record<CardStatus, readonly CardStatus[]>>;
