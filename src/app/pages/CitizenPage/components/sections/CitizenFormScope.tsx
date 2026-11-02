import { fieldIssue } from 'stores/LocalStore/CitizenStore';
import type { CitizenDraft } from 'types/form';

import { useCitizen, useCitizenStore } from '../../context';
import { FormScopeContext } from '../fields';

import type { FormScopeValue } from '../fields';
import type { ReactNode } from 'react';

const EMPTY: Readonly<Record<string, unknown>> = {};

export function CitizenFormScope({ children }: { children: ReactNode }) {
  const store = useCitizenStore();
  const draft = useCitizen((state) => state.draft);
  const citizen = useCitizen((state) => state.card?.citizen ?? null);
  const saving = useCitizen((state) => state.saving);

  const scope: FormScopeValue = {
    values: draft?.citizen ?? citizen ?? EMPTY,
    editing: draft !== null,
    disabled: saving,
    table: 'citizens',
    rowId: null,
    set: (field, value) => store.setField(field as keyof CitizenDraft, value as never),
    touch: (field) => store.touch('citizens', null, field),
    issue: (state, field) => fieldIssue(state, 'citizens', null, field),
  };
  return <FormScopeContext value={scope}>{children}</FormScopeContext>;
}
