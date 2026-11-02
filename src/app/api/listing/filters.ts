import type { IsoDate } from 'types/common';
import type { CitizenFilters, CitizenRow, FilterValue, NumberRange } from 'types/registry';
import { daysToIso, isoToDays } from 'utils/isoDate';
import { EXPIRY_KINDS } from 'utils/registry';

export type RowPredicate = (row: CitizenRow) => boolean;

function setOf(value: FilterValue | undefined): ReadonlySet<string> | null {
  return Array.isArray(value) && value.length > 0 ? new Set(value) : null;
}

function isOn(value: FilterValue | undefined): boolean {
  return value === true;
}

function daysOf(value: FilterValue | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

function rangeOf(value: FilterValue | undefined): NumberRange | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return value.min === null && value.max === null ? null : value;
}

const intersects = (items: readonly string[], set: ReadonlySet<string>): boolean =>
  items.some((item) => set.has(item));

export function compileFilters(filters: CitizenFilters, todayIso: IsoDate): RowPredicate | null {
  const today = isoToDays(todayIso);
  const daysAgo = (days: number): IsoDate => daysToIso(today - days);
  const checks: RowPredicate[] = [];

  const status = setOf(filters.status);
  if (status) checks.push((row) => status.has(row.status));

  const districts = setOf(filters.districtIds);
  if (districts) checks.push((row) => row.districtId !== null && districts.has(row.districtId));

  const gender = setOf(filters.gender);
  if (gender) checks.push((row) => gender.has(row.gender));

  const age = rangeOf(filters.age);
  if (age) {
    const { min, max } = age;
    checks.push((row) => (min === null || row.age >= min) && (max === null || row.age <= max));
  }

  const tags = setOf(filters.tags);
  if (tags) checks.push((row) => intersects(row.tags, tags));

  const responsibles = setOf(filters.responsibleIds);
  if (responsibles) checks.push((row) => responsibles.has(row.responsibleId));

  const expiringDays = daysOf(filters.expiringWithinDays);
  if (expiringDays !== null) {
    const kinds = setOf(filters.expiringKinds);
    const selected = EXPIRY_KINDS.filter((kind) => kinds === null || kinds.has(kind));
    const limit = daysAgo(-expiringDays);
    checks.push((row) =>
      selected.some((kind) => {
        const date = row.expiresAt[kind];
        return date !== null && date <= limit;
      })
    );
  }

  const noContactDays = daysOf(filters.noContactDays);
  if (noContactDays !== null) {
    const before = daysAgo(noContactDays);
    checks.push((row) => row.lastContactAt === null || row.lastContactAt < before);
  }

  if (isOn(filters.noContact)) checks.push((row) => !row.hasContact);

  const onReviewDays = daysOf(filters.onReviewDays);
  if (onReviewDays !== null) {
    const before = daysAgo(onReviewDays);
    checks.push((row) => row.status === 'review' && row.statusChangedAt < before);
  }

  const reviewReasons = setOf(filters.reviewReasons);
  if (reviewReasons) {
    checks.push((row) => row.reviewReason !== null && reviewReasons.has(row.reviewReason));
  }

  if (isOn(filters.noValidConsent)) checks.push((row) => !row.hasValidConsent);

  const channels = setOf(filters.contactChannels);
  if (channels) checks.push((row) => channels.has(row.contactChannel));

  const specialNeeds = setOf(filters.specialNeeds);
  if (specialNeeds) checks.push((row) => intersects(row.specialNeeds, specialNeeds));

  if (checks.length === 0) return null;
  return (row) => checks.every((check) => check(row));
}
