import type { IsoDate } from 'types/common';
import type { DebtAgeBucket } from 'types/dictionaries';
import type { CitizenFilters, CitizenRow, FilterValue, NumberRange } from 'types/registry';
import { daysToIso, isoToDays } from 'utils/isoDate';
import { EXPIRY_KINDS } from 'utils/registry';

export type RowPredicate = (row: CitizenRow) => boolean;

export function debtAgeBucket(months: number): DebtAgeBucket {
  if (months < 1) return 'lt1m';
  if (months < 3) return 'm1to3';
  if (months < 6) return 'm3to6';
  if (months < 12) return 'm6to12';
  return 'gt12';
}

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

  const benefitKinds = setOf(filters.benefitKinds);
  const benefitVerification = setOf(filters.benefitVerification);
  if (benefitKinds || benefitVerification) {
    const statuses = benefitVerification ?? new Set(['confirmed']);
    checks.push((row) =>
      row.benefits.some(
        (benefit) =>
          (benefitKinds === null || benefitKinds.has(benefit.kind)) &&
          statuses.has(benefit.verification)
      )
    );
  }

  if (isOn(filters.hasAnyBenefit)) checks.push((row) => row.benefitCategory !== null);

  const objectTypes = setOf(filters.objectTypes);
  if (objectTypes) checks.push((row) => intersects(row.objectTypes, objectTypes));

  if (isOn(filters.hasDebt)) checks.push((row) => row.debt > 0);

  const debtAge = setOf(filters.debtAge);
  if (debtAge) {
    checks.push(
      (row) => row.debtAgeMonths !== null && debtAge.has(debtAgeBucket(row.debtAgeMonths))
    );
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

  if (isOn(filters.deliveryFailed)) checks.push((row) => row.lastNotificationFailed);
  if (isOn(filters.noContact)) checks.push((row) => !row.hasContact);
  if (isOn(filters.unreachable)) {
    checks.push((row) => row.lastNotificationFailed || !row.hasContact);
  }

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
