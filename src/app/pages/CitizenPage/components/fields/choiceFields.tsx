import { FileInput } from 'components/FileInput';
import { MultiSelect } from 'components/MultiSelect';
import { SearchSelect } from 'components/SearchSelect';
import { Select } from 'components/Select';
import type { SelectOption } from 'components/Select';
import { Switch } from 'components/Switch';
import type { FileRef } from 'types/common';
import { formatFileSize } from 'utils/format';
import { labelIn } from 'utils/ui';

import { ViewPair } from './FieldGrid';
import styles from './fields.module.scss';
import { useBoundField, useFocusRequest } from './useBoundField';

import type { KeysOfType } from './useBoundField';

interface ChoiceFieldProps<T, V> {
  name: KeysOfType<T, V>;
  label: string;
  options: readonly SelectOption[];
  disabled?: boolean;
  className?: string;
}

export interface SelectFieldProps<T> extends ChoiceFieldProps<T, string | null> {
  placeholder?: string;
}

export function SelectField<T>({
  name,
  label,
  options,
  placeholder = 'Не выбрано',
  disabled,
  className,
}: SelectFieldProps<T>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLButtonElement>(name);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} className={className}>
        {labelIn(options, field.value)}
      </ViewPair>
    );
  }
  return (
    <Select
      ref={ref}
      label={label}
      options={options}
      value={typeof field.value === 'string' ? field.value : null}
      placeholder={placeholder}
      error={field.error}
      disabled={field.disabled || disabled}
      onChange={(value) => {
        field.set(value);
        field.onBlur();
      }}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

export function SearchSelectField<T>({
  name,
  label,
  options,
  disabled,
  className,
}: ChoiceFieldProps<T, string | null>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLButtonElement>(name);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} className={className}>
        {labelIn(options, field.value)}
      </ViewPair>
    );
  }
  return (
    <SearchSelect
      ref={ref}
      label={label}
      options={options}
      value={typeof field.value === 'string' ? field.value : null}
      error={field.error}
      hint={field.warning}
      disabled={field.disabled || disabled}
      onChange={field.set}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

export interface MultiSelectFieldProps<T> extends ChoiceFieldProps<T, readonly string[] | null> {
  emptyText?: string;
}

export function MultiSelectField<T>({
  name,
  label,
  options,
  emptyText = 'нет',
  disabled,
  className,
}: MultiSelectFieldProps<T>) {
  const field = useBoundField(name);
  const value = Array.isArray(field.value)
    ? field.value.filter((item): item is string => typeof item === 'string')
    : [];
  if (!field.form.editing) {
    const labels = options.filter((option) => value.includes(option.value));
    return (
      <ViewPair label={label} className={className}>
        {labels.length === 0 ? emptyText : labels.map((option) => option.label).join(', ')}
      </ViewPair>
    );
  }
  return (
    <MultiSelect
      label={label}
      options={options}
      value={value}
      placeholder="Не выбрано"
      error={field.error}
      disabled={field.disabled || disabled}
      onChange={field.set}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

export interface SwitchFieldProps<T> {
  name: KeysOfType<T, boolean | null>;
  label: string;
  hint?: string;
  off?: boolean;
  className?: string;
}

export function SwitchField<T>({ name, label, hint, off = false, className }: SwitchFieldProps<T>) {
  const field = useBoundField(name);
  const checked = !off && field.value === true;
  if (!field.form.editing) {
    return (
      <ViewPair label={label} className={className}>
        {checked ? 'Да' : 'Нет'}
      </ViewPair>
    );
  }
  return (
    <div className={styles.switchField}>
      <Switch
        label={label}
        hint={field.warning ?? (field.error || hint)}
        checked={checked}
        disabled={field.disabled || off}
        onChange={(next) => {
          field.set(next);
          field.onBlur();
        }}
        className={className}
      />
    </div>
  );
}

const isFileRef = (value: unknown): value is FileRef =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  'size' in value &&
  typeof value.name === 'string' &&
  typeof value.size === 'number';

export interface FileFieldProps<T> {
  name: KeysOfType<T, FileRef | null>;
  label: string;
  accept?: string;
  className?: string;
}

export function FileField<T>({ name, label, accept, className }: FileFieldProps<T>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLButtonElement>(name);
  const value = isFileRef(field.value) ? field.value : null;
  if (!field.form.editing) {
    return (
      <ViewPair label={label} className={className}>
        {value === null ? null : `${value.name}, ${formatFileSize(value.size)}`}
      </ViewPair>
    );
  }
  return (
    <FileInput
      ref={ref}
      label={label}
      value={value}
      accept={accept}
      error={field.error}
      disabled={field.disabled}
      onChange={field.set}
      onBlur={field.onBlur}
      className={className}
    />
  );
}
