import { createStore } from 'zustand/vanilla';

import { isApiError } from 'api';
import type { RegistryClient } from 'api';
import type { RootStore } from 'stores/RootStore';
import type { CitizenId, RowId } from 'types/common';
import type { CitizenCard, SectionKey } from 'types/entities';
import type { CardDraft, CitizenDraft, DraftRow, FieldIssue } from 'types/form';
import type { EditableTableKey } from 'types/storage';
import type { LocalStore } from 'types/store';
import {
  diffDraft,
  isEmptyDiff,
  toCardChanges,
  toDraft,
  withField,
  withTable,
  allowedStatuses,
  fieldKey,
  issueKey,
  rowTouchKey,
} from 'utils/card';
import {
  DEFAULT_SECTION,
  SECTION_LABELS,
  SECTION_ORDER,
  isSectionKey,
  sectionOf,
  newRowId,
} from 'utils/citizen';
import { messageOf } from 'utils/format';
import { isoToDays, toTimestamp } from 'utils/isoDate';
import { normalizeDraft } from 'utils/normalize';
import type { QueryParams } from 'utils/registry';
import { deleteBlocker, hasErrors, removeRow, validateCard, validateRow } from 'utils/validation';
import type { ValidationContext } from 'utils/validation';

import { ROW_TEMPLATES } from './rowTemplates';

import type { CitizenState, RowEditor, RowEditorOf } from './types';

export interface CitizenStoreDeps {
  rootStore: RootStore;
  api: RegistryClient;
  id: string;
  pathname: string;
}

const INITIAL_STATE: CitizenState = {
  load: { status: 'loading' },
  card: null,
  base: null,
  draft: null,
  mode: 'view',
  section: DEFAULT_SECTION,
  dirty: false,
  issues: [],
  touched: {},
  submitted: false,
  serverIssues: [],
  duplicate: null,
  originalHint: null,
  saving: false,
  rowEditor: null,
  toasts: [],
  announcement: null,
  focusRequest: null,
};

function editorFor<K extends EditableTableKey>(
  editor: RowEditor | null,
  table: K
): RowEditorOf<K> | null {
  return editor !== null && editor.table === table ? (editor as RowEditorOf<K>) : null;
}

const asEditor = <K extends EditableTableKey>(editor: RowEditorOf<K>): RowEditor =>
  editor as unknown as RowEditor;

export class CitizenStore implements LocalStore {
  readonly state = createStore<CitizenState>()(() => INITIAL_STATE);
  readonly id: CitizenId | null;

  private readonly rootStore: RootStore;
  private readonly api: RegistryClient;
  private readonly pathname: string;

  private unsubscribe: (() => void) | null = null;
  private loadToken = 0;
  private alive = false;
  private snilsToken: string | null = null;
  private originalToken: CitizenId | null = null;
  private sequence = 0;

  constructor({ rootStore, api, id, pathname }: CitizenStoreDeps) {
    this.rootStore = rootStore;
    this.api = api;
    this.id = /^[1-9]\d{0,8}$/.test(id) ? Number(id) : null;
    this.pathname = pathname;
  }

  get today(): string {
    return this.api.today;
  }

  init(): void {
    if (this.unsubscribe !== null) return;
    this.alive = true;
    const location = this.rootStore.queryParams.state;
    this.unsubscribe = location.subscribe(({ pathname, params }) => {
      if (pathname === this.pathname) this.applySection(params);
    });
    this.applySection(location.getState().params);
    if (this.state.getState().load.status !== 'ready') this.load();
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.alive = false;
    this.loadToken += 1;
    this.snilsToken = null;
    this.originalToken = null;
  }

  retry(): void {
    this.load();
  }

  selectSection(section: SectionKey): void {
    this.rootStore.queryParams.setParams(
      { tab: section === DEFAULT_SECTION ? null : section },
      { push: true }
    );
  }

  private applySection(params: QueryParams): void {
    const tab = params.tab?.[0];
    const section = isSectionKey(tab) ? tab : DEFAULT_SECTION;
    if (section !== this.state.getState().section) this.state.setState({ section });
  }

  private load(): void {
    const id = this.id;
    if (id === null) {
      this.state.setState({ load: { status: 'notFound' } });
      return;
    }
    const token = ++this.loadToken;
    this.state.setState({ load: { status: 'loading' } });
    this.api.getCard(id).then(
      (card) => {
        if (token === this.loadToken) this.showCard(card);
      },
      (error: unknown) => {
        if (token !== this.loadToken) return;
        this.state.setState({
          load: isApiError(error, 'notFound')
            ? { status: 'notFound' }
            : { status: 'error', message: messageOf(error) },
        });
      }
    );
  }

  private showCard(card: CitizenCard): void {
    this.state.setState({
      load: { status: 'ready' },
      card,
      base: normalizeDraft(toDraft(card)),
      draft: null,
      mode: 'view',
      dirty: false,
      issues: [],
      touched: {},
      submitted: false,
      serverIssues: [],
      duplicate: null,
      originalHint: null,
      saving: false,
      rowEditor: null,
    });
  }

  startEdit(): void {
    const { base, load, mode } = this.state.getState();
    if (base === null || load.status !== 'ready' || mode === 'edit') return;
    this.state.setState({ mode: 'edit', touched: {}, submitted: false, serverIssues: [] });
    this.commit(base);
  }

  cancelEdit(): void {
    const { card, saving } = this.state.getState();
    if (card === null || saving) return;
    this.snilsToken = null;
    this.originalToken = null;
    this.showCard(card);
  }

  setField<F extends keyof CitizenDraft>(field: F, value: CitizenDraft[F]): void {
    const { draft, saving, serverIssues } = this.state.getState();
    if (draft === null || saving) return;
    const key = fieldKey('citizens', null, field);
    if (field === 'snils') this.snilsToken = null;
    if (field === 'originalCardId') this.originalToken = null;
    this.commit(
      { citizen: withField(draft.citizen, field, value), related: draft.related },
      {
        serverIssues: serverIssues.filter((issue) => issueKey(issue) !== key),
        ...(field === 'snils' ? { duplicate: null } : {}),
        ...(field === 'originalCardId' ? { originalHint: null } : {}),
      }
    );
  }

  touch(table: string, rowId: RowId | null, field: string): void {
    const key = fieldKey(table, rowId, field);
    const { touched } = this.state.getState();
    if (touched[key] !== true) this.state.setState({ touched: { ...touched, [key]: true } });
    if (table === 'citizens' && field === 'snils') this.checkSnils();
    if (table === 'citizens' && field === 'originalCardId') this.checkOriginal();
  }

  save(): void {
    const { draft, base, card, saving } = this.state.getState();
    if (draft === null || base === null || card === null || saving || this.id === null) return;
    const normalized = normalizeDraft(draft);
    const issues = validateCard(normalized, this.context(normalized));
    if (hasErrors(issues)) {
      this.state.setState({ issues });
      this.reject(issues);
      return;
    }
    const diff = diffDraft(base, normalized);
    if (isEmptyDiff(diff)) {
      this.cancelEdit();
      return;
    }
    const changes = toCardChanges(diff);
    if (changes === null) {
      this.reject(issues);
      return;
    }

    this.state.setState({ saving: true, submitted: true, rowEditor: null, announcement: null });
    this.api.saveCard(this.id, changes).then(
      (result) => {
        if (!this.alive) return;
        if (result.ok) {
          this.showCard(result.card);
          this.toast('info', 'Изменения сохранены');
          this.state.setState({ announcement: 'Изменения сохранены' });
          return;
        }
        this.state.setState({ saving: false, serverIssues: result.issues });
        this.reject(result.issues);
      },
      (error: unknown) => {
        if (!this.alive) return;
        this.state.setState({ saving: false });
        this.toast('negative', `Не удалось сохранить: ${messageOf(error)}`);
      }
    );
  }

  markAsDuplicate(): void {
    const { duplicate, draft, card } = this.state.getState();
    if (duplicate === null || draft === null || card === null) return;
    if (!allowedStatuses(card.citizen.status).includes('duplicate')) {
      this.toast('negative', 'Из текущего статуса нельзя перевести карточку в «Дубликат»');
      return;
    }
    this.setField('status', 'duplicate');
    this.setField('originalCardId', duplicate.existingId);
    this.touch('citizens', null, 'originalCardId');
  }

  dismissToast(id: string): void {
    this.state.setState(({ toasts }) => ({ toasts: toasts.filter((toast) => toast.id !== id) }));
  }

  openRowEditor<K extends EditableTableKey>(table: K, rowId: RowId | null): void {
    const { draft, base, saving } = this.state.getState();
    if (draft === null || base === null || saving || this.id === null) return;
    const rows: DraftRow<K>[] = draft.related[table];
    let row: DraftRow<K> | undefined;
    if (rowId === null) {
      const taken = [...base.related[table], ...rows].map((item) => item.id);
      row = ROW_TEMPLATES[table](
        { id: newRowId(this.id, table, taken), citizenId: this.id },
        { now: this.now(), responsibleId: draft.citizen.responsibleId }
      );
    } else {
      row = rows.find((item) => item.id === rowId);
    }
    if (row === undefined) return;
    const editor: RowEditorOf<K> = {
      table,
      row,
      isNew: rowId === null,
      issues: validateRow(table, row, { today: this.today, citizen: draft.citizen }),
      touched: {},
      submitted: false,
    };
    this.state.setState({ rowEditor: asEditor(editor) });
  }

  setRowField<K extends EditableTableKey, F extends keyof DraftRow<K>>(
    table: K,
    field: F,
    value: DraftRow<K>[F]
  ): void {
    const { rowEditor, draft } = this.state.getState();
    const editor = editorFor(rowEditor, table);
    if (editor === null || draft === null) return;
    const row = withField(editor.row, field, value);
    const issues = validateRow(table, row, { today: this.today, citizen: draft.citizen });
    this.state.setState({ rowEditor: asEditor({ ...editor, row, issues }) });
  }

  touchRowField(field: string): void {
    const { rowEditor } = this.state.getState();
    if (rowEditor === null || rowEditor.touched[field] === true) return;
    this.state.setState({
      rowEditor: { ...rowEditor, touched: { ...rowEditor.touched, [field]: true } },
    });
  }

  applyRow(): boolean {
    const { rowEditor } = this.state.getState();
    if (rowEditor === null) return false;
    return this.applyRowOf(rowEditor.table);
  }

  closeRowEditor(): void {
    this.state.setState({ rowEditor: null });
  }

  canDeleteRow(table: EditableTableKey, rowId: RowId): boolean {
    const { draft, card } = this.state.getState();
    if (draft === null || card === null) return false;
    const blocker = deleteBlocker(draft, table, rowId, card.related.payments);
    if (blocker !== null) this.toast('negative', blocker);
    return blocker === null;
  }

  deleteRow(table: EditableTableKey, rowId: RowId): boolean {
    const { draft, card, saving } = this.state.getState();
    if (draft === null || card === null || saving) return false;
    const blocker = deleteBlocker(draft, table, rowId, card.related.payments);
    if (blocker !== null) {
      this.toast('negative', blocker);
      return false;
    }
    this.commit(removeRow(draft, table, rowId), { touched: this.touchedWith(table, null) });
    return true;
  }

  private applyRowOf<K extends EditableTableKey>(table: K): boolean {
    const { rowEditor, draft } = this.state.getState();
    const editor = editorFor(rowEditor, table);
    if (editor === null || draft === null) return false;
    if (hasErrors(editor.issues)) {
      this.state.setState({ rowEditor: asEditor({ ...editor, submitted: true }) });
      return false;
    }
    const rows: DraftRow<K>[] = draft.related[table];
    const next = editor.isNew
      ? [...rows, editor.row]
      : rows.map((row) => (row.id === editor.row.id ? editor.row : row));
    this.commit(withTable(draft, table, next), {
      rowEditor: null,
      touched: this.touchedWith(table, editor.row.id),
    });
    return true;
  }

  private commit(next: CardDraft, extra: Partial<CitizenState> = {}): void {
    const { base } = this.state.getState();
    const normalized = normalizeDraft(next);
    this.state.setState({
      draft: next,
      issues: validateCard(normalized, this.context(normalized)),
      dirty: base !== null && !isEmptyDiff(diffDraft(base, normalized)),
      ...extra,
    });
  }

  private context(draft: CardDraft): ValidationContext {
    const { card } = this.state.getState();
    return {
      today: this.today,
      citizenId: this.id ?? 0,
      previousStatus: card?.citizen.status ?? draft.citizen.status ?? 'active',
      payments: card?.related.payments ?? [],
    };
  }

  private reject(issues: readonly FieldIssue[]): void {
    const errors = issues.filter((issue) => issue.severity === 'error');
    const first = [...errors].sort(
      (a, b) => SECTION_ORDER.indexOf(sectionOf(a)) - SECTION_ORDER.indexOf(sectionOf(b))
    )[0];
    this.state.setState({ submitted: true });
    if (first === undefined) return;
    const section = sectionOf(first);
    this.state.setState({
      announcement: `Не сохранено: ошибок — ${errors.length}. Первая в разделе «${SECTION_LABELS[section]}»`,
      focusRequest: { key: issueKey(first), nonce: ++this.sequence },
    });
    this.selectSection(section);
  }

  private touchedWith(table: string, rowId: RowId | null): Record<string, true> {
    const touched = { ...this.state.getState().touched, [rowTouchKey(table, null)]: true as const };
    if (rowId !== null) touched[rowTouchKey(table, rowId)] = true;
    return touched;
  }

  private checkSnils(): void {
    const { draft, base } = this.state.getState();
    const snils = draft?.citizen.snils ?? null;
    if (
      this.id === null ||
      snils === null ||
      snils.length !== 11 ||
      snils === base?.citizen.snils
    ) {
      this.snilsToken = null;
      this.state.setState({ duplicate: null });
      return;
    }
    if (this.snilsToken === snils) return;
    this.snilsToken = snils;
    this.api.findBySnils(snils, this.id).then(
      (duplicate) => {
        if (!this.alive || this.snilsToken !== snils) return;
        if (this.state.getState().draft?.citizen.snils !== snils) return;
        this.state.setState({ duplicate });
      },
      () => {
        if (this.snilsToken === snils) this.snilsToken = null;
      }
    );
  }

  private checkOriginal(): void {
    const id = this.state.getState().draft?.citizen.originalCardId ?? null;
    if (id === null) {
      this.originalToken = null;
      this.state.setState({ originalHint: null });
      return;
    }
    if (this.originalToken === id) return;
    this.originalToken = id;
    this.state.setState({ originalHint: { status: 'checking', id } });
    const stale = () =>
      !this.alive ||
      this.originalToken !== id ||
      this.state.getState().draft?.citizen.originalCardId !== id;
    this.api.getPreview(id).then(
      ({ citizen }) => {
        if (stale()) return;
        const fullName = [citizen.lastName, citizen.firstName, citizen.middleName]
          .filter(Boolean)
          .join(' ');
        this.state.setState({ originalHint: { status: 'found', id, fullName } });
      },
      (error: unknown) => {
        if (stale()) return;
        this.state.setState({
          originalHint: isApiError(error, 'notFound') ? { status: 'missing', id } : null,
        });
      }
    );
  }

  private toast(tone: 'info' | 'negative', text: string): void {
    const id = `toast-${++this.sequence}`;
    this.state.setState(({ toasts }) => ({ toasts: [...toasts, { id, tone, text }] }));
  }

  private now(): string {
    const clock = new Date();
    return toTimestamp(
      isoToDays(this.today),
      clock.getHours() * 3600 + clock.getMinutes() * 60 + clock.getSeconds()
    );
  }
}
