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
export type ContractStatus = 'active' | 'notConcluded' | 'terminated';
export type ConclusionMethod = 'govServices' | 'office' | 'online';
export type FamilyRelation = 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
export type FamilyResidence = 'permanent' | 'temporarilyAbsent';
export type FamilyCategory = 'preschooler' | 'schoolchild' | 'student' | 'working' | 'pensioner';

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
  | 'contractStatus'
  | 'conclusionMethod'
  | 'familyRelation'
  | 'familyResidence'
  | 'familyCategory'
  | 'district'
  | 'region'
  | 'responsible'
  | 'maritalStatus'
  | 'citizenship'
  | 'language';

export interface DictionaryItem {
  value: DictValue;
  label: string;
}

export type Dictionaries = Readonly<Record<DictionaryKey, readonly DictionaryItem[]>>;

export type ExpiryKind = 'document' | 'consent';
export type DeadlineTone = 'none' | 'soon' | 'overdue';
export type SortDirection = 'asc' | 'desc';

export type StatusTransitions = Readonly<Record<CardStatus, readonly CardStatus[]>>;
