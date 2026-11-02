import type { CitizenId } from 'types/common';
import type { CitizenCard, SectionKey } from 'types/entities';
import type { CardDraft, DraftRow, DuplicateWarning, FieldIssue } from 'types/form';
import type { EditableTableKey } from 'types/storage';

export type LoadState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'notFound' }
  | { status: 'error'; message: string };

export type CardMode = 'view' | 'edit';

export interface RowEditorOf<K extends EditableTableKey> {
  table: K;
  row: DraftRow<K>;
  isNew: boolean;
  issues: FieldIssue[];
  touched: Readonly<Record<string, true>>;
  submitted: boolean;
}

export type RowEditor = { [K in EditableTableKey]: RowEditorOf<K> }[EditableTableKey];

export type OriginalHint =
  | { status: 'checking'; id: CitizenId }
  | { status: 'found'; id: CitizenId; fullName: string }
  | { status: 'missing'; id: CitizenId };

export interface CardToast {
  id: string;
  tone: 'info' | 'negative';
  text: string;
}

export interface CitizenState {
  load: LoadState;
  card: CitizenCard | null;
  base: CardDraft | null;
  draft: CardDraft | null;
  mode: CardMode;
  section: SectionKey;
  dirty: boolean;
  issues: FieldIssue[];
  touched: Readonly<Record<string, true>>;
  submitted: boolean;
  serverIssues: FieldIssue[];
  duplicate: DuplicateWarning | null;
  originalHint: OriginalHint | null;
  saving: boolean;
  rowEditor: RowEditor | null;
  toasts: CardToast[];
  announcement: string | null;
  focusRequest: { key: string; nonce: number } | null;
}
