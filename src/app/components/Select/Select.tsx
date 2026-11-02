import cn from 'classnames';
import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Icon } from 'components/Icon';
import { usePopup } from 'components/MultiSelect';
import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';
import type { SelectOption } from 'types/ui';

import styles from './Select.module.scss';

import type { FocusEvent, KeyboardEvent, Ref } from 'react';

export interface SelectProps<T extends string = string> {
  label: string;

  options: readonly SelectOption<T>[];

  value: T | null;

  onChange: (value: T | null) => void;

  placeholder?: string;

  hideLabel?: boolean;

  error?: string;

  disabled?: boolean;

  onBlur?: () => void;

  ref?: Ref<HTMLButtonElement>;

  className?: string;
}

export function Select<T extends string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Не важно',
  hideLabel = false,
  error,
  disabled,
  onBlur,
  ref,
  className,
}: SelectProps<T>) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const { hasError, errorId, describedBy } = useFieldDescription({ error });

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const choices: { option: SelectOption<T> | null; index: number }[] = [
    { option: null, index: -1 },
    ...options.map((option, index) => ({ option, index })),
  ];
  const activeChoice = choices[Math.min(active, choices.length - 1)];
  const activeId = open && activeChoice !== undefined ? optionId(activeChoice.index) : undefined;
  const selected = options.find((option) => option.value === value);

  function openPopup() {
    const current = choices.findIndex((choice) => (choice.option?.value ?? null) === value);
    setActive(Math.max(current, 0));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    onBlur?.();
  }

  function choose(option: SelectOption<T> | null) {
    onChange(option === null ? null : option.value);
    close();
  }

  const { popupRef, listRef } = usePopup({
    open,
    itemCount: choices.length,
    activeId,
    rootRef,
    triggerRef,
    onDismiss: close,
  });

  function findByLetter(letter: string): number {
    const from = Math.min(active, choices.length - 1);
    for (let step = 1; step <= choices.length; step += 1) {
      const position = (from + step) % choices.length;
      const text = choices[position]?.option?.label ?? placeholder;
      if (text.toLocaleLowerCase('ru').startsWith(letter)) return position;
    }
    return -1;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = choices.length - 1;

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openPopup();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        setActive(Math.min(active + 1, last));
        break;
      case 'ArrowUp':
        setActive(Math.max(Math.min(active, last) - 1, 0));
        break;
      case 'Home':
        setActive(0);
        break;
      case 'End':
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        if (activeChoice !== undefined) choose(activeChoice.option);
        break;
      case 'Escape':
        event.stopPropagation();
        close();
        break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const position = findByLetter(event.key.toLocaleLowerCase('ru'));
        if (position !== -1) setActive(position);
      }
    }
    event.preventDefault();
  }

  function handleBlur(event: FocusEvent<HTMLButtonElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && popupRef.current?.contains(next)) return;
    close();
  }

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
        aria-activedescendant={activeId}
        aria-labelledby={labelId}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? close() : openPopup())}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
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
      {error !== undefined && (
        <div className={styles.footer}>
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
            onMouseDown={(event) => event.preventDefault()}
          >
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              className={styles.list}
            >
              {choices.map(({ option, index }, position) => {
                const isSelected = (option?.value ?? null) === value;

                return (
                  <li
                    key={option?.value ?? '__none'}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
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
                    {isSelected && <Icon name="check" size="sm" color="link" />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
