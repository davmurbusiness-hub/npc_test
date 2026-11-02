import cn from 'classnames';
import { useId, useState } from 'react';

import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';

import styles from './Input.module.scss';

import type { ChangeEvent, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'children'
> {
  label: string;
  hint?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  hint,
  error,
  className,
  id: idProp,
  disabled,
  value,
  defaultValue,
  onChange,
  placeholder,
  'aria-invalid': ariaInvalid,
  'aria-describedby': foreignDescribedBy,
  ref,
  ...rest
}: InputProps) {
  const autoId = useId();

  const id = idProp || autoId;
  const [typedLength, setTypedLength] = useState(String(defaultValue ?? '').length);
  const isEmpty = value === undefined ? typedLength === 0 : String(value).length === 0;

  const {
    hasHint,
    showHint: showHintBelow,
    hasError,
    hintId,
    errorId,
    describedBy,
  } = useFieldDescription({ hint, error, describedBy: foreignDescribedBy, hintShown: !isEmpty });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setTypedLength(event.target.value.length);
    onChange?.(event);
  }

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
      <input
        {...rest}
        ref={ref}
        id={id}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={hasHint && isEmpty ? hint : placeholder}
        disabled={disabled}
        className={styles.input}
        aria-invalid={hasError ? true : ariaInvalid}
        aria-describedby={describedBy}
      />
      <div className={styles.footer}>
        {showHintBelow && (
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
