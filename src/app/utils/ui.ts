import type { ActionQueueKind } from 'types/dashboard';
import type {
  BenefitVerification,
  CardStatus,
  ContractStatus,
  DeliveryStatus,
  EducationStatus,
  PaymentStatus,
  RepresentativeStatus,
  DebtAgeBucket,
  DeadlineTone,
  ExpiryKind,
} from 'types/dictionaries';
import type { BadgeTone, SelectOption } from 'types/ui';

export const STATUS_TONE: Readonly<Record<CardStatus, BadgeTone>> = {
  active: 'positive',
  review: 'warning',
  archived: 'neutral',
  duplicate: 'negative',
};

export const CONTRACT_TONE: Readonly<Record<ContractStatus, BadgeTone>> = {
  active: 'positive',
  notConcluded: 'warning',
  terminated: 'neutral',
};

export const VERIFICATION_TONE: Readonly<Record<BenefitVerification, BadgeTone>> = {
  confirmed: 'positive',
  onReview: 'warning',
  expired: 'neutral',
  rejected: 'negative',
};

export const REPRESENTATIVE_TONE: Readonly<Record<RepresentativeStatus, BadgeTone>> = {
  active: 'positive',
  expired: 'neutral',
  revoked: 'negative',
};

export const EDUCATION_TONE: Readonly<Record<EducationStatus, BadgeTone>> = {
  graduated: 'positive',
  studying: 'info',
  notGraduated: 'neutral',
};

export const PAYMENT_TONE: Readonly<Record<PaymentStatus, BadgeTone>> = {
  paid: 'positive',
  partial: 'warning',
  debt: 'negative',
};

export const DELIVERY_TONE: Readonly<Record<DeliveryStatus, BadgeTone>> = {
  delivered: 'positive',
  error: 'negative',
  unread: 'info',
};

export const DEBT_AGE_LABELS: Readonly<Record<DebtAgeBucket, string>> = {
  lt1m: 'До 1 месяца',
  m1to3: '1–3 месяца',
  m3to6: '3–6 месяцев',
  m6to12: '6–12 месяцев',
  gt12: 'Больше года',
};

export const EXPIRY_KIND_LABELS: Readonly<Record<ExpiryKind, string>> = {
  document: 'Документ',
  benefit: 'Льгота',
  powerOfAttorney: 'Доверенность',
  consent: 'Согласие ПДн',
};

export const ACTION_QUEUE_LABELS: Readonly<Record<ActionQueueKind, string>> = {
  documentExpiring: 'Документ истекает ≤ 30 дн',
  benefitExpiring: 'Льгота истекает ≤ 30 дн',
  powerOfAttorneyExpiring: 'Доверенность истекает ≤ 30 дн',
  noConsent: 'Нет действующего согласия ПДн',
  reviewOver14: 'На проверке > 14 дн',
  duplicatesToMerge: 'Дубликаты к слиянию',
  deliveryErrors: 'Ошибки доставки',
};

export const DEADLINE_TONE_LABELS: Readonly<Record<Exclude<DeadlineTone, 'none'>, string>> = {
  soon: 'В ближайшие 7 дн',
  overdue: 'Просрочено',
};

function toOptions(labels: Readonly<Record<string, string>>): readonly SelectOption<string>[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export const DEBT_AGE_OPTIONS = toOptions(DEBT_AGE_LABELS);
export const EXPIRY_KIND_OPTIONS = toOptions(EXPIRY_KIND_LABELS);

export function optionLabel(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function labelIn(options: readonly SelectOption[], value: unknown): string | null {
  return typeof value === 'string' ? optionLabel(options, value) : null;
}
