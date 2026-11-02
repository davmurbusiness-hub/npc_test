import cn from 'classnames';
import { useId, useRef } from 'react';

import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';
import type { FileRef } from 'types/common';
import { formatFileSize } from 'utils/format';

import styles from './FileInput.module.scss';

import type { ChangeEvent, Ref } from 'react';

export interface FileInputProps {
  label: string;
  value: FileRef | null;
  onChange: (value: FileRef | null) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
  accept?: string;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

export function FileInput({
  label,
  value,
  onChange,
  onBlur,
  hint,
  error,
  accept,
  disabled,
  ref,
  className,
}: FileInputProps) {
  const labelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { showHint, hasError, hintId, errorId, describedBy } = useFieldDescription({
    hint,
    error,
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file === undefined) return;
    onChange({ name: file.name, size: file.size, mime: file.type || 'application/octet-stream' });
    onBlur?.();
  }

  return (
    <div className={cn(styles.root, className)} role="group" aria-labelledby={labelId}>
      <Text as="span" id={labelId} size="sm" color="secondary">
        {label}
      </Text>
      <div className={cn(styles.field, hasError && styles.invalid)}>
        {value === null ? (
          <Text as="span" size="sm" color="tertiary" className={styles.name}>
            Файл не выбран
          </Text>
        ) : (
          <span className={styles.file}>
            <Icon name="paperclip" size="sm" color="secondary" />
            <Text as="span" size="sm" truncate className={styles.name}>
              {value.name}
            </Text>
            <Text as="span" size="xs" color="tertiary">
              {formatFileSize(value.size)}
            </Text>
          </span>
        )}
        {value !== null && !disabled && (
          <IconButton
            icon="close"
            size="sm"
            label="Убрать файл"
            onClick={() => {
              onChange(null);
              onBlur?.();
            }}
          />
        )}
        <Button
          ref={ref}
          size="sm"
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          onClick={() => inputRef.current?.click()}
        >
          {value === null ? 'Выбрать файл' : 'Заменить'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          tabIndex={-1}
          aria-hidden="true"
          className={styles.native}
          onChange={handleChange}
        />
      </div>
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
