import { rowsOf } from 'stores/LocalStore/CitizenStore';
import type { DraftRow } from 'types/form';
import type { EditableTableKey } from 'types/storage';

import { useCitizen } from '../../context';

export function useRows<K extends EditableTableKey>(table: K): readonly DraftRow<K>[] {
  return useCitizen((state) => rowsOf(state, table));
}
