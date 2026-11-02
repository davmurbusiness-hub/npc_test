import { useLayoutEffect, useRef } from 'react';

import { Input } from 'components/Input';
import type { InputProps } from 'components/Input';
import type { Mask } from 'utils/masks';

import type { ChangeEvent, KeyboardEvent, Ref } from 'react';

export interface MaskedInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'ref'
> {
  mask: Mask;
  value: string | null;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
}

const countDigits = (text: string): number => text.replace(/\D/g, '').length;

function positionAfterDigits(text: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text.charAt(index))) seen += 1;
    if (seen === count) return index + 1;
  }
  return text.length;
}

export function MaskedInput({ mask, value, onChange, onKeyDown, ref, ...rest }: MaskedInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caret = useRef<number | null>(null);
  const text = mask.format(value ?? '');

  useLayoutEffect(() => {
    const input = inputRef.current;
    const digits = caret.current;
    caret.current = null;
    if (input === null || digits === null || document.activeElement !== input) return;
    const position = positionAfterDigits(text, digits);
    input.setSelectionRange(position, position);
  }, [text]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const next = mask.parse(raw);
    const formatted = mask.format(next);
    let digits = countDigits(raw.slice(0, event.target.selectionStart ?? raw.length));
    digits = Math.min(digits + countDigits(formatted) - countDigits(raw), countDigits(formatted));
    caret.current = Math.max(0, digits);
    onChange(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    const input = event.currentTarget;
    if (event.key !== 'Backspace' || input.selectionStart !== input.selectionEnd) return;
    let position = input.selectionStart ?? 0;
    while (position > 0 && !/\d/.test(input.value.charAt(position - 1))) position -= 1;
    if (position !== input.selectionStart) input.setSelectionRange(position, position);
  }

  return (
    <Input
      {...rest}
      ref={(node) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}
