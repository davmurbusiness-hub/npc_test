import type { RowId } from 'types/common';
import type { SectionKey } from 'types/entities';
import type { DraftRow, FieldIssue } from 'types/form';
import type { EditableTableKey } from 'types/storage';
import { fieldKey, issueKey, rowTouchKey } from 'utils/card';
import { sectionOf } from 'utils/citizen';

import type { CitizenState } from './types';

export function isVisibleIssue(state: CitizenState, issue: FieldIssue): boolean {
  return (
    state.submitted ||
    state.touched[issueKey(issue)] === true ||
    state.touched[rowTouchKey(issue.table, issue.rowId)] === true
  );
}

export function fieldIssue(
  state: CitizenState,
  table: string,
  rowId: RowId | null,
  field: string
): FieldIssue | undefined {
  const key = fieldKey(table, rowId, field);
  const server = state.serverIssues.find((issue) => issueKey(issue) === key);
  if (server !== undefined) return server;
  let warning: FieldIssue | undefined;
  for (const issue of state.issues) {
    if (issueKey(issue) !== key || !isVisibleIssue(state, issue)) continue;
    if (issue.severity === 'error') return issue;
    warning ??= issue;
  }
  return warning;
}

export function sectionErrorCount(state: CitizenState, section: SectionKey): number {
  let count = 0;
  for (const issue of state.issues) {
    if (
      issue.severity === 'error' &&
      sectionOf(issue) === section &&
      isVisibleIssue(state, issue)
    ) {
      count += 1;
    }
  }
  for (const issue of state.serverIssues) {
    if (issue.severity === 'error' && sectionOf(issue) === section) count += 1;
  }
  return count;
}

export function rowHasErrors(state: CitizenState, table: string, rowId: RowId): boolean {
  return [...state.issues, ...state.serverIssues].some(
    (issue) =>
      issue.severity === 'error' &&
      issue.table === table &&
      issue.rowId === rowId &&
      isVisibleIssue(state, issue)
  );
}

export function tableIssue(state: CitizenState, table: string): FieldIssue | undefined {
  return [...state.serverIssues, ...state.issues].find(
    (issue) => issue.table === table && issue.rowId === null && isVisibleIssue(state, issue)
  );
}

export function visibleDuplicate(state: CitizenState) {
  const { duplicate, draft } = state;
  if (duplicate === null || draft === null) return null;
  const marked =
    draft.citizen.status === 'duplicate' && draft.citizen.originalCardId === duplicate.existingId;
  return marked ? null : duplicate;
}

export function rowEditorIssue(state: CitizenState, field: string): FieldIssue | undefined {
  const editor = state.rowEditor;
  if (editor === null || (!editor.submitted && editor.touched[field] !== true)) return undefined;
  const own = editor.issues.filter((issue) => issue.field === field);
  return own.find((issue) => issue.severity === 'error') ?? own[0];
}

export function rowsWithErrors(state: CitizenState, table: string): string {
  const ids = new Set<string>();
  for (const issue of [...state.issues, ...state.serverIssues]) {
    if (
      issue.severity === 'error' &&
      issue.table === table &&
      issue.rowId !== null &&
      isVisibleIssue(state, issue)
    ) {
      ids.add(issue.rowId);
    }
  }
  return [...ids].join('|');
}

export const hasUnsavedWork = (state: CitizenState): boolean => state.dirty || state.saving;

const NO_ROWS: readonly never[] = [];

export function rowsOf<K extends EditableTableKey>(
  state: CitizenState,
  table: K
): readonly DraftRow<K>[] {
  return (state.draft ?? state.base)?.related[table] ?? NO_ROWS;
}
