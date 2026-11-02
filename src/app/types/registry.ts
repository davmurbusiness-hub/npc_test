import type { CitizenId, DictValue, IsoDate, IsoDateTime, Rubles } from './common';
import type {
  BenefitKind,
  BenefitVerification,
  CardStatus,
  CitizenTag,
  ContactChannel,
  ExpiryKind,
  Gender,
  ObjectType,
  ReviewReason,
  SortDirection,
  SpecialNeed,
} from './dictionaries';
import type { BenefitCategory } from './entities';

export interface BenefitBrief {
  kind: BenefitKind;
  verification: BenefitVerification;
  monthlyDiscount: Rubles;
}

export interface CitizenRow {
  id: CitizenId;
  cardNumber: string;
  fullName: string;
  birthDate: IsoDate;
  age: number;
  mobilePhone: string | null;
  districtId: DictValue | null;
  status: CardStatus;
  benefitCategory: BenefitCategory | null;
  debt: Rubles;
  responsibleId: DictValue;
  updatedAt: IsoDateTime;

  searchName: string;
  snils: string;
  accountNumbers: string[];

  gender: Gender;
  objectTypes: ObjectType[];
  tags: CitizenTag[];
  contactChannel: ContactChannel;
  specialNeeds: SpecialNeed[];

  debtAgeMonths: number | null;
  lastContactAt: IsoDate | null;
  statusChangedAt: IsoDate;
  reviewReason: ReviewReason | null;
  expiresAt: Record<ExpiryKind, IsoDate | null>;
  hasValidConsent: boolean;
  hasContact: boolean;
  lastNotificationFailed: boolean;
  benefits: BenefitBrief[];
}

export type CitizenIndex = readonly CitizenRow[];

export interface NumberRange {
  min: number | null;
  max: number | null;
}

export type FilterValue = DictValue[] | NumberRange | boolean | number | null;

export type CitizenFilters = Readonly<Record<string, FilterValue>>;

export type SortField =
  | 'cardNumber'
  | 'fullName'
  | 'birthDate'
  | 'age'
  | 'mobilePhone'
  | 'districtId'
  | 'status'
  | 'debt'
  | 'responsibleId'
  | 'updatedAt';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface CitizenQuery {
  search: string;
  filters: CitizenFilters;
  sort: SortState;
  page: number;
  pageSize: number;
}

export interface CitizenPage {
  rows: CitizenRow[];
  found: number;
  total: number;
  page: number;
  pageSize: number;
}

export interface Drilldown {
  filters: CitizenFilters;
  search?: string;
}
