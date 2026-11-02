import type { ActionQueueKind } from 'types/dashboard';
import type { CardStatus, ContractStatus, DeadlineTone, ExpiryKind } from 'types/dictionaries';
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

export const EXPIRY_KIND_LABELS: Readonly<Record<ExpiryKind, string>> = {
  document: 'Документ',
  consent: 'Согласие ПДн',
};

export const ACTION_QUEUE_LABELS: Readonly<Record<ActionQueueKind, string>> = {
  documentExpiring: 'Документ истекает ≤ 30 дн',
  noConsent: 'Нет действующего согласия ПДн',
  reviewOver14: 'На проверке > 14 дн',
  duplicatesToMerge: 'Дубликаты к слиянию',
};

export const DEADLINE_TONE_LABELS: Readonly<Record<Exclude<DeadlineTone, 'none'>, string>> = {
  soon: 'В ближайшие 7 дн',
  overdue: 'Просрочено',
};

function toOptions(labels: Readonly<Record<string, string>>): readonly SelectOption<string>[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export const EXPIRY_KIND_OPTIONS = toOptions(EXPIRY_KIND_LABELS);

export function optionLabel(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function labelIn(options: readonly SelectOption[], value: unknown): string | null {
  return typeof value === 'string' ? optionLabel(options, value) : null;
}
