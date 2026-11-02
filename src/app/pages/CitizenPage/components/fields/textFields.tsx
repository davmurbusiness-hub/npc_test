import cn from 'classnames';
import { useState } from 'react';

import { Badge } from 'components/Badge';
import { Input } from 'components/Input';
import { MaskedInput } from 'components/MaskedInput';
import { Textarea } from 'components/Textarea';
import type { IsoDate } from 'types/common';
import { deadlineTone } from 'utils/dashboard';
import { formatIsoDate, formatNumber, textOrNull } from 'utils/format';
import type { NumberFormat } from 'utils/format';
import { MASKS, formatMasked } from 'utils/masks';
import type { MaskName } from 'utils/masks';

import { ViewPair } from './FieldGrid';
import styles from './fields.module.scss';
import { useBoundField, useFocusRequest } from './useBoundField';
import { useCitizenStore } from '../../context';

import type { KeysOfType } from './useBoundField';

interface BaseFieldProps<T, V> {
  name: KeysOfType<T, V>;
  label: string;
  hint?: string;
  disabled?: boolean;
  wide?: boolean;
  className?: string;
}

const asText = (value: unknown): string | null => (typeof value === 'string' ? value : null);

export function TextField<T>({
  name,
  label,
  hint,
  disabled,
  wide,
  className,
}: BaseFieldProps<T, string | null>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLInputElement>(name);
  const value = asText(field.value);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} wide={wide} className={className}>
        {value}
      </ViewPair>
    );
  }
  return (
    <Input
      ref={ref}
      label={label}
      hint={field.warning ?? hint}
      error={field.error}
      value={value ?? ''}
      disabled={field.disabled || disabled}
      onChange={(event) => field.set(textOrNull(event.target.value))}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

export function TextareaField<T>({
  name,
  label,
  hint,
  disabled,
  className,
}: BaseFieldProps<T, string | null>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLTextAreaElement>(name);
  const value = asText(field.value);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} wide className={className}>
        {value}
      </ViewPair>
    );
  }
  return (
    <Textarea
      ref={ref}
      label={label}
      hint={field.warning ?? hint}
      error={field.error}
      value={value ?? ''}
      disabled={field.disabled || disabled}
      onChange={(event) => field.set(textOrNull(event.target.value))}
      onBlur={field.onBlur}
      className={cn(styles.wide, className)}
    />
  );
}

export interface MaskedFieldProps<T> extends BaseFieldProps<T, string | null> {
  mask: MaskName;
}

export function MaskedField<T>({
  name,
  label,
  hint,
  disabled,
  mask,
  wide,
  className,
}: MaskedFieldProps<T>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLInputElement>(name);
  const value = asText(field.value);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} wide={wide} className={className}>
        {value === null ? null : formatMasked(mask, value)}
      </ViewPair>
    );
  }
  return (
    <MaskedInput
      ref={ref}
      label={label}
      hint={field.warning ?? hint}
      error={field.error}
      mask={MASKS[mask]}
      value={value}
      disabled={field.disabled || disabled}
      onChange={(digits) => field.set(digits === '' ? null : digits)}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

const DEADLINE_TEXT = { soon: 'Скоро истекает', overdue: 'Истёк' } as const;

export function DeadlineBadge({ date }: { date: IsoDate | null }) {
  const { today } = useCitizenStore();
  const tone = deadlineTone(date, today);
  if (tone === 'none') return null;
  return <Badge tone={tone === 'soon' ? 'warning' : 'negative'}>{DEADLINE_TEXT[tone]}</Badge>;
}

export interface DateFieldProps<T> extends BaseFieldProps<T, string | null> {
  deadline?: boolean;
}

export function DateField<T>({
  name,
  label,
  hint,
  disabled,
  deadline,
  wide,
  className,
}: DateFieldProps<T>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLInputElement>(name);
  const value = asText(field.value);
  if (!field.form.editing) {
    return (
      <ViewPair label={label} wide={wide} className={className}>
        {value === null ? null : (
          <>
            {formatIsoDate(value)}
            {deadline && <DeadlineBadge date={value} />}
          </>
        )}
      </ViewPair>
    );
  }
  return (
    <Input
      ref={ref}
      type="date"
      label={label}
      hint={field.warning ?? hint}
      error={field.error}
      value={value ?? ''}
      disabled={field.disabled || disabled}
      onChange={(event) => field.set(textOrNull(event.target.value))}
      onBlur={field.onBlur}
      className={className}
    />
  );
}

const toText = (value: number | null): string =>
  value === null || Number.isNaN(value) ? '' : String(value).replace('.', ',');

function parseNumber(text: string, integer: boolean): number | null {
  const normalized = text.replace(/\s/g, '').replace(',', '.');
  if (normalized === '') return null;
  const value = Number(normalized);
  return Number.isFinite(value) && (!integer || Number.isInteger(value)) ? value : Number.NaN;
}

export interface NumberFieldProps<T> extends BaseFieldProps<T, number | null> {
  integer?: boolean;
  format?: NumberFormat;
  unit?: string;
}

export function NumberField<T>({
  name,
  label,
  hint,
  disabled,
  integer = false,
  format = 'decimal',
  unit,
  wide,
  className,
}: NumberFieldProps<T>) {
  const field = useBoundField(name);
  const ref = useFocusRequest<HTMLInputElement>(name);
  const value = typeof field.value === 'number' ? field.value : null;
  const [text, setText] = useState(() => toText(value));
  const [synced, setSynced] = useState(value);
  if (!Object.is(value, synced)) {
    setSynced(value);
    setText(toText(value));
  }

  if (!field.form.editing) {
    const shown = formatNumber(value, format);
    return (
      <ViewPair label={label} wide={wide} className={className}>
        {shown === null ? null : unit ? `${shown} ${unit}` : shown}
      </ViewPair>
    );
  }
  return (
    <Input
      ref={ref}
      label={label}
      hint={field.warning ?? hint}
      error={field.error}
      inputMode={integer ? 'numeric' : 'decimal'}
      value={text}
      disabled={field.disabled || disabled}
      onChange={(event) => {
        const next = parseNumber(event.target.value, integer);
        setText(event.target.value);
        setSynced(next);
        field.set(next);
      }}
      onBlur={field.onBlur}
      className={className}
    />
  );
}
