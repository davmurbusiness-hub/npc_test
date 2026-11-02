import cn from 'classnames';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import type { SelectOption } from 'components/Select';
import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';
import { getFocusable } from 'utils/dom';

import styles from './MultiSelect.module.scss';
import { usePopup } from './usePopup';

import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';

export interface MultiSelectProps<T extends string = string> {
  label: string;

  options: readonly SelectOption<T>[];

  value: readonly T[];

  onChange: (value: T[]) => void;

  placeholder?: string;

  searchable?: boolean;

  hideLabel?: boolean;

  error?: string;

  disabled?: boolean;

  onBlur?: () => void;

  className?: string;
}

const SEARCHABLE_FROM = 8;

function matches(option: SelectOption, query: string): boolean {
  return option.label.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'));
}

function summary<T extends string>(
  options: readonly SelectOption<T>[],
  value: readonly T[],
  placeholder: string
): string {
  const selected = options.filter((option) => value.includes(option.value));
  const [first] = selected;
  if (first === undefined) return placeholder;
  return selected.length === 1 ? first.label : `${first.label} +${selected.length - 1}`;
}

export function MultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Все',
  searchable = options.length >= SEARCHABLE_FROM,
  hideLabel = false,
  error,
  disabled,
  onBlur,
  className,
}: MultiSelectProps<T>) {
  const { hasError, errorId, describedBy } = useFieldDescription({ error });
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const visible = options.flatMap((option, index) =>
    matches(option, query) ? [{ option, index }] : []
  );
  const activeItem = visible[Math.min(active, visible.length - 1)];
  const activeId = open && activeItem !== undefined ? optionId(activeItem.index) : undefined;

  function openPopup() {
    const firstSelected = options.findIndex((option) => value.includes(option.value));
    setActive(Math.max(firstSelected, 0));
    setOpen(true);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    setQuery('');
    onBlur?.();
    if (restoreFocus) triggerRef.current?.focus();
  }

  function toggle(option: SelectOption<T>) {
    onChange(
      value.includes(option.value)
        ? value.filter((item) => item !== option.value)
        : [...value, option.value]
    );
  }

  const { popupRef, listRef } = usePopup({
    open,
    itemCount: visible.length,
    activeId,
    rootRef,
    triggerRef,
    onDismiss: () => close(false),
  });

  useEffect(() => {
    if (open) (searchable ? searchRef.current : listRef.current)?.focus({ preventScroll: true });
  }, [open, searchable, listRef]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    openPopup();
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLElement>) {
    const inSearch = event.currentTarget === searchRef.current;
    const last = Math.max(visible.length - 1, 0);

    switch (event.key) {
      case 'ArrowDown':
        setActive(Math.min(active + 1, last));
        break;
      case 'ArrowUp':
        setActive(Math.max(Math.min(active, last) - 1, 0));
        break;
      case 'Home':
      case 'End':
        if (inSearch) return;
        setActive(event.key === 'Home' ? 0 : last);
        break;
      case ' ':
        if (inSearch) return;
        if (activeItem) toggle(activeItem.option);
        break;
      case 'Enter':
        if (activeItem) toggle(activeItem.option);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function handlePopupKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key !== 'Tab') return;
    event.stopPropagation();

    const items = getFocusable(event.currentTarget);
    const edge = event.shiftKey ? items[0] : items.at(-1);
    if (document.activeElement !== edge) return;
    if (event.shiftKey) event.preventDefault();
    close(true);
  }

  function handleTriggerBlur(event: FocusEvent<HTMLButtonElement>) {
    const next = event.relatedTarget;
    if (open || (next instanceof Node && popupRef.current?.contains(next))) return;
    onBlur?.();
  }

  function handlePopupBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (!(next instanceof Node)) return;
    if (event.currentTarget.contains(next) || rootRef.current?.contains(next)) return;
    close(false);
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActive(0);
  }

  const text = summary(options, value, placeholder);

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <Text
        as="span"
        id={labelId}
        size="sm"
        color="secondary"
        className={cn(hideLabel && styles.hiddenLabel)}
      >
        {label}
      </Text>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => {
          if (open) close(false);
          else openPopup();
        }}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        className={cn(styles.trigger, value.length === 0 && styles.empty)}
      >
        <span className={styles.value}>{text}</span>
        <Icon
          name="chevronDown"
          size="sm"
          color="secondary"
          className={cn(styles.chevron, open && styles.chevronOpen)}
        />
      </button>
      {error !== undefined && (
        <div className={styles.fieldFooter}>
          {hasError && (
            <Text as="p" id={errorId} size="sm" color="negative">
              {error}
            </Text>
          )}
        </div>
      )}
      {open &&
        createPortal(
          <div
            ref={popupRef}
            className={styles.popup}
            onKeyDown={handlePopupKeyDown}
            onBlur={handlePopupBlur}
          >
            {searchable && (
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
                  onKeyDown={handleListKeyDown}
                  className={styles.searchInput}
                />
              </div>
            )}
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable="true"
              aria-labelledby={labelId}
              aria-activedescendant={searchable ? undefined : activeId}
              tabIndex={searchable ? undefined : 0}
              onKeyDown={searchable ? undefined : handleListKeyDown}
              className={styles.list}
            >
              {visible.map(({ option, index }, position) => {
                const selected = value.includes(option.value);

                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      setActive(position);
                      toggle(option);
                    }}
                    onPointerMove={() => {
                      if (position !== active) setActive(position);
                    }}
                    className={cn(styles.option, index === activeItem?.index && styles.active)}
                  >
                    <span className={cn(styles.box, selected && styles.checked)} aria-hidden="true">
                      {selected && <Icon name="check" size="sm" />}
                    </span>
                    <span className={styles.optionLabel}>{option.label}</span>
                  </li>
                );
              })}
            </ul>
            {visible.length === 0 && (
              <Text as="p" role="status" size="sm" color="tertiary" className={styles.nothing}>
                Ничего не найдено
              </Text>
            )}
            <div className={styles.footer}>
              <Button
                variant="ghost"
                size="sm"
                disabled={value.length === 0}
                onClick={() => {
                  onChange([]);
                  (searchRef.current ?? listRef.current)?.focus();
                }}
              >
                Очистить
              </Button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
