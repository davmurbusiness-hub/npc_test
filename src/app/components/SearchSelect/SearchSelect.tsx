import cn from 'classnames';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from 'components/Icon';
import { usePopup } from 'components/MultiSelect';
import type { SelectOption } from 'components/Select';
import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';

import styles from './SearchSelect.module.scss';

import type { ChangeEvent, FocusEvent, KeyboardEvent, Ref } from 'react';

export interface SearchSelectProps<T extends string = string> {
  label: string;
  options: readonly SelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}

const matches = (option: SelectOption, query: string): boolean =>
  option.label.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'));

export function SearchSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Не выбрано',
  hint,
  error,
  disabled,
  ref,
  className,
}: SearchSelectProps<T>) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const { showHint, hasError, hintId, errorId, describedBy } = useFieldDescription({
    hint,
    error,
  });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const choices: { option: SelectOption<T> | null; index: number }[] = [
    ...(query.trim() === '' ? [{ option: null, index: -1 }] : []),
    ...options.flatMap((option, index) => (matches(option, query) ? [{ option, index }] : [])),
  ];
  const activeChoice = choices[Math.min(active, choices.length - 1)];
  const activeId = open && activeChoice !== undefined ? optionId(activeChoice.index) : undefined;
  const selected = options.find((option) => option.value === value);

  function openPopup() {
    const current = choices.findIndex((choice) => choice.option?.value === value);
    setActive(Math.max(current, 0));
    setOpen(true);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    setQuery('');
    onBlur?.();
    if (restoreFocus) triggerRef.current?.focus();
  }

  function choose(option: SelectOption<T> | null) {
    onChange(option === null ? null : option.value);
    close(true);
  }

  const { popupRef, listRef } = usePopup({
    open,
    itemCount: choices.length,
    activeId,
    rootRef,
    triggerRef,
    onDismiss: () => close(false),
  });

  useEffect(() => {
    if (open) searchRef.current?.focus({ preventScroll: true });
  }, [open]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    openPopup();
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const last = Math.max(choices.length - 1, 0);
    switch (event.key) {
      case 'ArrowDown':
        setActive(Math.min(active + 1, last));
        break;
      case 'ArrowUp':
        setActive(Math.max(Math.min(active, last) - 1, 0));
        break;
      case 'Enter':
        if (activeChoice !== undefined) choose(activeChoice.option);
        break;
      case 'Escape':
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        return;
      default:
        return;
    }
    event.preventDefault();
  }

  function handleTriggerBlur(event: FocusEvent<HTMLButtonElement>) {
    const next = event.relatedTarget;
    if (open || (next instanceof Node && popupRef.current?.contains(next))) return;
    onBlur?.();
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActive(0);
  }

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <Text
        as="span"
        id={labelId}
        size="sm"
        color="secondary"
        className={cn(disabled && styles.labelDisabled)}
      >
        {label}
      </Text>
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close(false) : openPopup())}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        className={cn(styles.trigger, selected === undefined && styles.empty)}
      >
        <span className={styles.value}>{selected?.label ?? placeholder}</span>
        <Icon
          name="chevronDown"
          size="sm"
          color="secondary"
          className={cn(styles.chevron, open && styles.chevronOpen)}
        />
      </button>
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
      {open &&
        createPortal(
          <div ref={popupRef} className={styles.popup}>
            <div className={styles.search}>
              <Icon name="search" size="sm" color="tertiary" />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeId}
                aria-label={`Поиск: ${label}`}
                placeholder="Поиск"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleSearchKeyDown}
                className={styles.searchInput}
              />
            </div>
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              className={styles.list}
            >
              {choices.map(({ option, index }, position) => (
                <li
                  key={option?.value ?? '__none'}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option === null ? value === null : option.value === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  onPointerMove={() => {
                    if (position !== active) setActive(position);
                  }}
                  className={cn(
                    styles.option,
                    position === Math.min(active, choices.length - 1) && styles.active,
                    option === null && styles.none
                  )}
                >
                  <span className={styles.optionLabel}>{option?.label ?? placeholder}</span>
                  {(option === null ? value === null : option.value === value) && (
                    <Icon name="check" size="sm" color="link" />
                  )}
                </li>
              ))}
            </ul>
            {choices.length === 0 && (
              <Text as="p" role="status" size="sm" color="tertiary" className={styles.nothing}>
                Ничего не найдено
              </Text>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
