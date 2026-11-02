import cn from 'classnames';
import { useId } from 'react';

import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';

import styles from './Textarea.module.scss';

import type { Ref, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  id: idProp,
  disabled,
  rows = 3,
  'aria-describedby': foreignDescribedBy,
  ref,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const id = idProp || autoId;
  const { showHint, hasError, hintId, errorId, describedBy } = useFieldDescription({
    hint,
    error,
    describedBy: foreignDescribedBy,
  });

  return (
    <div className={cn(styles.root, className)}>
      <Text
        as="label"
        htmlFor={id}
        size="sm"
        color="secondary"
        className={cn(disabled && styles.labelDisabled)}
      >
        {label}
      </Text>
      <textarea
        {...rest}
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        className={styles.textarea}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
      />
      <div className={styles.footer}>
        {showHint && (
          <Text as="p" id={hintId} size="sm" color="tertiary">
            {hint}
          </Text>
        )}
        {hasError && (
          <Text as="p" id={errorId} size="sm" color="negative">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
