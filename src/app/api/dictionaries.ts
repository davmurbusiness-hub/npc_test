import { DICTIONARIES, labelOf } from 'data/dictionaries';
import type { DictionaryKey } from 'types/dictionaries';
import type { BenefitCategory } from 'types/entities';
import type { SelectOption } from 'types/ui';

export { DICTIONARIES, codesOf, labelOf } from 'data/dictionaries';

export function optionsOf(key: DictionaryKey): readonly SelectOption[] {
  return DICTIONARIES[key];
}

export function formatBenefitCategory(category: BenefitCategory | null): string {
  if (category === null) return '';
  const label = labelOf('benefitKind', category.kind);
  return category.extra > 0 ? `${label} +${category.extra}` : label;
}
