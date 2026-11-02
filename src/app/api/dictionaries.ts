import { DICTIONARIES } from 'data/dictionaries';
import type { DictionaryKey } from 'types/dictionaries';
import type { SelectOption } from 'types/ui';

export { DICTIONARIES, codesOf, labelOf } from 'data/dictionaries';

export function optionsOf(key: DictionaryKey): readonly SelectOption[] {
  return DICTIONARIES[key];
}
