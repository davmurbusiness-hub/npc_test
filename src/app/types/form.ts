import type { CitizenId, RowId } from './common';
import type { CitizenEditable, RelatedBase, SectionKey, TableKey } from './entities';
import type { EditableRowMap, EditableTableKey } from './storage';

export type Severity = 'error' | 'warning';

export type RowDraft<T> = { [K in keyof T]: T[K] | null };

export type CitizenDraft = RowDraft<CitizenEditable>;

export type DraftRow<K extends EditableTableKey> = RelatedBase &
  RowDraft<Omit<EditableRowMap[K], keyof RelatedBase>>;

export interface CardDraft {
  citizen: CitizenDraft;
  related: { [K in EditableTableKey]: DraftRow<K>[] };
}

export type IssueCode =
  'required' | 'mask' | 'format' | 'range' | 'order' | 'consistency' | 'referenced';

export interface FieldIssue {
  table: TableKey;
  rowId: RowId | null;
  field: string;
  severity: Severity;
  code: IssueCode;
  message: string;
}

export type SectionIssueCount = Partial<Record<SectionKey, number>>;

export interface DuplicateWarning {
  snils: string;
  existingId: CitizenId;
  existingCardNumber: string;
  existingFullName: string;
}

export interface FormState {
  dirty: boolean;
  touched: Record<string, boolean>;
  issues: FieldIssue[];
  duplicate: DuplicateWarning | null;
}
