import cn from 'classnames';
import { useId, useState } from 'react';

import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';

import styles from './Input.module.scss';

import type { ChangeEvent, HTMLInputTypeAttribute, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'children'
> {
  label: string;

  hint?: string;

  numeric?: boolean;

  error?: string;

  className?: string;

  id?: string;

  type?: HTMLInputTypeAttribute;

  disabled?: boolean;

  value?: InputHTMLAttributes<HTMLInputElement>['value'];

  defaultValue?: InputHTMLAttributes<HTMLInputElement>['defaultValue'];

  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  placeholder?: string;

  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];

  pattern?: string;

  'aria-invalid'?: InputHTMLAttributes<HTMLInputElement>['aria-invalid'];

  'aria-describedby'?: string;

  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  hint,
  error,
  numeric,
  className,
  id: idProp,
  type = 'text',
  disabled,
  value,
  defaultValue,
  onChange,
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
    if (numeric) event.target.value = event.target.value.replace(/\D/g, '');
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
        wrap="normal"
        className={cn(disabled && styles.labelDisabled)}
      >
        {label}
      </Text>
      <input
        {...rest}
        ref={ref}
        id={id}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={hasHint && isEmpty ? hint : rest.placeholder}
        inputMode={numeric ? 'numeric' : rest.inputMode}
        pattern={numeric ? '[0-9]*' : rest.pattern}
        disabled={disabled}
        className={styles.input}
        aria-invalid={hasError ? true : ariaInvalid}
        aria-describedby={describedBy}
      />
      <div className={styles.footer}>
        {showHintBelow && (
          <Text as="p" id={hintId} size="sm" color="tertiary" wrap="normal">
            {hint}
          </Text>
        )}
        {hasError && (
          <Text as="p" id={errorId} size="sm" color="negative" wrap="normal">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
