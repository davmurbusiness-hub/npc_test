import cn from 'classnames';

import { labelOf } from 'api/dictionaries';
import { Button } from 'components/Button';
import { Chip } from 'components/Chip';
import type { DictionaryKey } from 'types/dictionaries';
import type { CitizenFilters } from 'types/registry';
import { daysFilter, listFilter, rangeFilter, switchFilter, withFilter } from 'utils/registry';
import type { FilterKey, ListFilterKey } from 'utils/registry';
import { DEBT_AGE_OPTIONS, EXPIRY_KIND_OPTIONS, optionLabel } from 'utils/ui';

import styles from './ActiveFilterChips.module.scss';

export interface ActiveFilterChipsProps {
  filters: CitizenFilters;
  onChange: (next: CitizenFilters) => void;
  onReset: () => void;
  className?: string;
}

const CHIP_ORDER: readonly FilterKey[] = [
  'status',
  'districtIds',
  'gender',
  'age',
  'hasDebt',
  'debtAge',
  'objectTypes',
  'hasAnyBenefit',
  'benefitKinds',
  'benefitVerification',
  'expiringKinds',
  'expiringWithinDays',
  'contactChannels',
  'noContactDays',
  'deliveryFailed',
  'noContact',
  'unreachable',
  'specialNeeds',
  'tags',
  'responsibleIds',
  'onReviewDays',
  'reviewReasons',
  'noValidConsent',
];

const MAX_LISTED = 2;

interface ChipText {
  short: string;
  full: string;
}

function plain(text: string): ChipText {
  return { short: text, full: text };
}

function listText(title: string, labels: readonly string[]): ChipText | null {
  const [first] = labels;
  if (first === undefined) return null;
  const full = `${title}: ${labels.join(', ')}`;
  const short = labels.length <= MAX_LISTED ? full : `${title}: ${first} +${labels.length - 1}`;
  return { short, full };
}

function dictListText(
  filters: CitizenFilters,
  key: ListFilterKey,
  title: string,
  dictionary: DictionaryKey
): ChipText | null {
  const labels = listFilter(filters, key).map((code) => labelOf(dictionary, code) || code);
  return listText(title, labels);
}

function daysText(value: number | null, template: (days: number) => string): ChipText | null {
  return value === null ? null : plain(template(value));
}

function chipText(filters: CitizenFilters, key: FilterKey): ChipText | null {
  switch (key) {
    case 'status':
      return dictListText(filters, key, 'Статус', 'cardStatus');
    case 'districtIds':
      return dictListText(filters, key, 'Район', 'district');
    case 'gender': {
      const [gender] = listFilter(filters, key);
      if (gender === undefined) return null;
      return plain(`Пол: ${(labelOf('gender', gender) || gender).toLowerCase()}`);
    }
    case 'age': {
      const { min, max } = rangeFilter(filters, key);
      if (min !== null && max !== null) return plain(`Возраст: ${min}–${max}`);
      if (min !== null) return plain(`Возраст: от ${min}`);
      if (max !== null) return plain(`Возраст: до ${max}`);
      return null;
    }
    case 'benefitKinds':
      return dictListText(filters, key, 'Льготы', 'benefitKind');
    case 'benefitVerification':
      return dictListText(filters, key, 'Проверка льгот', 'benefitVerification');
    case 'hasAnyBenefit':
      return switchFilter(filters, key) ? plain('Есть подтверждённая льгота') : null;
    case 'objectTypes':
      return dictListText(filters, key, 'Тип объекта', 'objectType');
    case 'hasDebt':
      return switchFilter(filters, key) ? plain('Есть долг') : null;
    case 'debtAge':
      return listText(
        'Давность долга',
        listFilter(filters, key).map((code) => optionLabel(DEBT_AGE_OPTIONS, code))
      );
    case 'tags':
      return dictListText(filters, key, 'Метки', 'citizenTag');
    case 'responsibleIds':
      return dictListText(filters, key, 'Ответственный', 'responsible');
    case 'expiringKinds':
      return listText(
        'Истекает',
        listFilter(filters, key).map((code) => optionLabel(EXPIRY_KIND_OPTIONS, code))
      );
    case 'expiringWithinDays':
      return daysText(daysFilter(filters, key), (days) => `Срок истекает ≤ ${days} дн`);
    case 'noContactDays':
      return daysText(daysFilter(filters, key), (days) => `Без контакта > ${days} дн`);
    case 'deliveryFailed':
      return switchFilter(filters, key) ? plain('Ошибка доставки') : null;
    case 'noContact':
      return switchFilter(filters, key) ? plain('Нет телефона и email') : null;
    case 'unreachable':
      return switchFilter(filters, key) ? plain('Недоступен для уведомления') : null;
    case 'onReviewDays':
      return daysText(daysFilter(filters, key), (days) => `На проверке > ${days} дн`);
    case 'reviewReasons':
      return dictListText(filters, key, 'Причина проверки', 'reviewReason');
    case 'noValidConsent':
      return switchFilter(filters, key) ? plain('Нет согласия ПДн') : null;
    case 'contactChannels':
      return dictListText(filters, key, 'Канал связи', 'contactChannel');
    case 'specialNeeds':
      return dictListText(filters, key, 'Особые потребности', 'specialNeed');
  }
}

export function ActiveFilterChips({
  filters,
  onChange,
  onReset,
  className,
}: ActiveFilterChipsProps) {
  const chips = CHIP_ORDER.flatMap((key) => {
    const text = chipText(filters, key);
    return text === null ? [] : [{ key, ...text }];
  });

  if (chips.length === 0) return null;

  return (
    <div className={cn(styles.root, className)}>
      <ul aria-label="Применённые фильтры" className={styles.list}>
        {chips.map(({ key, short, full }) => (
          <li key={key} className={styles.item}>
            <Chip
              removeLabel={`Убрать фильтр «${full}»`}
              onRemove={() => {
                onChange(withFilter(filters, key, null));
              }}
            >
              {short}
            </Chip>
          </li>
        ))}
      </ul>
      <Button variant="ghost" size="sm" onClick={onReset}>
        Сбросить всё
      </Button>
    </div>
  );
}
