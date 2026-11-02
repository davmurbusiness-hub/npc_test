import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { Icon } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Input } from 'components/Input';

import styles from './SearchField.module.scss';

import type { ChangeEvent, KeyboardEvent } from 'react';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DEBOUNCE_MS = 300;

export function SearchField({ value, onChange, className }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [text, setText] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  const [emitted, setEmitted] = useState(value);

  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== emitted) {
      setText(value);
      setEmitted(value);
    }
  }

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function emit(next: string) {
    window.clearTimeout(timerRef.current);
    setEmitted(next);
    onChange(next);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setText(next);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      emit(next);
    }, DEBOUNCE_MS);
  }

  function clear() {
    setText('');
    emit('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape' || text === '') return;
    event.preventDefault();
    clear();
  }

  function handleClearClick() {
    clear();
    inputRef.current?.focus();
  }

  return (
    <div role="search" className={cn(styles.root, className)}>
      <Input
        ref={inputRef}
        label="Поиск по картотеке"
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        placeholder="ФИО, телефон, СНИЛС или № ЛС"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(styles.field, text !== '' && styles.hasValue)}
      />
      <Icon name="search" color="tertiary" className={styles.searchIcon} />
      {text !== '' && (
        <IconButton
          icon="close"
          size="sm"
          label="Очистить поиск"
          onClick={handleClearClick}
          className={styles.clear}
        />
      )}
    </div>
  );
}
