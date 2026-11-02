import { createContext, use, useEffect, useRef } from 'react';

import type { CitizenState } from 'stores/LocalStore/CitizenStore';
import type { RowId } from 'types/common';
import type { FieldIssue } from 'types/form';
import { fieldKey } from 'utils/card';

import { useCitizen } from '../../context';

export interface FormScopeValue {
  values: Readonly<Record<string, unknown>>;
  editing: boolean;
  disabled: boolean;
  table: string;
  rowId: RowId | null;
  set: (field: string, value: unknown) => void;
  touch: (field: string) => void;
  issue: (state: CitizenState, field: string) => FieldIssue | undefined;
}

export const FormScopeContext = createContext<FormScopeValue | null>(null);

export function useFormScope(): FormScopeValue {
  const scope = use(FormScopeContext);
  if (scope === null) throw new Error('Поле карточки вне FormScopeContext');
  return scope;
}

export type KeysOfType<T, V> = Extract<
  { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T],
  string
>;

export function useBoundField(name: string) {
  const form = useFormScope();
  const issue = useCitizen((state) => form.issue(state, name));

  return {
    form,
    value: form.values[name],
    error: issue?.severity === 'error' ? issue.message : '',
    warning: issue?.severity === 'warning' ? issue.message : undefined,
    disabled: form.disabled,
    onBlur: () => form.touch(name),
    set: (value: unknown) => form.set(name, value),
  };
}

export function useFocusRequest<E extends HTMLElement>(name: string) {
  const form = useFormScope();
  const focusRequest = useCitizen((state) => state.focusRequest);
  const ref = useRef<E>(null);
  const key = fieldKey(form.table, form.rowId, name);

  useEffect(() => {
    if (focusRequest?.key !== key) return;
    const node = ref.current;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView({ block: 'center' });
  }, [focusRequest, key]);

  return ref;
}
