import { useId } from 'react';

import { isEmptyNode } from 'utils/isEmptyNode';
import { textOrNull } from 'utils/textOrNull';

import type { ReactNode } from 'react';

export interface FieldDescriptionOptions {
  hint?: ReactNode;

  error?: ReactNode;

  describedBy?: string;

  hintShown?: boolean;
}

export interface FieldDescription {
  hintId: string;

  errorId: string;

  hasHint: boolean;

  showHint: boolean;

  hasError: boolean;

  describedBy: string | undefined;
}

export function useFieldDescription(options: FieldDescriptionOptions = {}): FieldDescription {
  const { hint, error, describedBy: foreign, hintShown = true } = options;
  const hintId = useId();
  const errorId = useId();

  const hasHint = !isEmptyNode(hint);
  const hasError = !isEmptyNode(error);
  const showHint = hasHint && hintShown;

  const foreignText = textOrNull(foreign)?.trim() ?? null;

  const ids: string[] = [];
  if (showHint) ids.push(hintId);
  if (hasError) ids.push(errorId);
  if (foreignText !== null) ids.push(foreignText);

  return {
    hintId,
    errorId,
    hasHint,
    showHint,
    hasError,
    describedBy: ids.length > 0 ? ids.join(' ') : undefined,
  };
}
