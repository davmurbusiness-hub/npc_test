import type { CitizenId, DictValue, IsoDate, IsoDateTime } from './common';
import type {
  CardStatus,
  CitizenTag,
  ContactChannel,
  ExpiryKind,
  Gender,
  ReviewReason,
  SortDirection,
  SpecialNeed,
} from './dictionaries';
export interface CitizenRow {
  id: CitizenId;
  cardNumber: string;
  fullName: string;
  birthDate: IsoDate;
  age: number;
  mobilePhone: string | null;
  districtId: DictValue | null;
  status: CardStatus;
  responsibleId: DictValue;
  updatedAt: IsoDateTime;

  searchName: string;
  snils: string;

  gender: Gender;
  tags: CitizenTag[];
  contactChannel: ContactChannel;
  specialNeeds: SpecialNeed[];

  lastContactAt: IsoDate | null;
  statusChangedAt: IsoDate;
  reviewReason: ReviewReason | null;
  expiresAt: Record<ExpiryKind, IsoDate | null>;
  hasValidConsent: boolean;
  hasContact: boolean;
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
