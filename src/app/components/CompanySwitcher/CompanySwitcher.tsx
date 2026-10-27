import cn from 'classnames';
import { useEffect, useId, useRef, useState } from 'react';

import { Icon } from 'components/Icon';

import styles from './CompanySwitcher.module.scss';

import type { FocusEvent, KeyboardEvent, Ref } from 'react';

export interface CompanyOption {
  id: string;

  name: string;

  description?: string;

  logoUrl?: string;
}

export interface CompanySwitcherProps {
  label: string;

  companies: readonly CompanyOption[];

  value: string | null;

  onChange: (value: string | null) => void;

  allLabel?: string;

  allDescription?: string;

  disabled?: boolean;

  loading?: boolean;

  ref?: Ref<HTMLButtonElement>;

  className?: string;
}

interface Item {
  value: string | null;
  name: string;
  description?: string;
  logoUrl?: string;

  group?: boolean;
}

interface LogoProps {
  name: string;
  logoUrl?: string;

  bare?: boolean;
  className?: string;
}

const STACK_SIZE = 4;
const LEGAL_FORMS: ReadonlySet<string> = new Set(['ООО', 'ИП', 'АО', 'ПАО', 'ЗАО', 'ОАО', 'НКО']);
const QUOTED = /[«"“]([^»"”]+)[»"”]/;

function initialOf(name: string): string {
  const source = QUOTED.exec(name)?.[1] ?? name;
  const words = source
    .split(/\s+/)
    .filter((word) => word !== '' && !LEGAL_FORMS.has(word.toUpperCase()));
  const first = [...(words[0] ?? source.trim())][0];
  return first === undefined ? '?' : first.toUpperCase();
}

function Logo({ name, logoUrl, bare = false, className }: LogoProps) {
  const [failed, setFailed] = useState<string | undefined>(undefined);

  if (logoUrl !== undefined && logoUrl !== failed) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={className}
        onError={() => {
          setFailed(logoUrl);
        }}
      />
    );
  }
  if (bare) return <span className={className} />;
  return <span className={cn(className, styles.initial)}>{initialOf(name)}</span>;
}

function Avatar({ item, stack }: { item: Item; stack: readonly CompanyOption[] }) {
  if (item.group === true) {
    return (
      <span className={cn(styles.avatar, styles.stack)} aria-hidden="true">
        {stack.slice(0, STACK_SIZE).map((company) => (
          <Logo
            key={company.id}
            name={company.name}
            logoUrl={company.logoUrl}
            bare
            className={styles.tile}
          />
        ))}
      </span>
    );
  }
  return (
    <span className={styles.avatar} aria-hidden="true">
      <Logo name={item.name} logoUrl={item.logoUrl} className={styles.logo} />
    </span>
  );
}

function Details({ item }: { item: Item }) {
  return (
    <span className={styles.text}>
      <span className={styles.name}>{item.name}</span>
      {item.description !== undefined && item.description !== '' && (
        <span className={styles.description}>{item.description}</span>
      )}
    </span>
  );
}

export function CompanySwitcher({
  label,
  companies,
  value,
  onChange,
  allLabel,
  allDescription,
  disabled = false,
  loading = false,
  ref,
  className,
}: CompanySwitcherProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items: readonly Item[] = [
    ...(allLabel === undefined
      ? []
      : [{ value: null, name: allLabel, description: allDescription, group: true }]),
    ...companies.map(({ id, name, description, logoUrl }) => ({
      value: id,
      name,
      description,
      logoUrl,
    })),
  ];
  const selectedIndex = items.findIndex((item) => item.value === value);
  const selected = items[selectedIndex];
  const interactive = items.length > 1;
  const expanded = open && interactive && !disabled && !loading;

  if (open && !expanded) setOpen(false);

  useEffect(() => {
    if (expanded) listRef.current?.focus();
  }, [expanded]);

  useEffect(() => {
    if (!expanded || activeIndex < 0) return;
    listRef.current?.children.item(activeIndex)?.scrollIntoView({ block: 'nearest' });
  }, [expanded, activeIndex]);

  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }

  function openAt(index: number) {
    setActiveIndex(index);
    setOpen(true);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const item = items[index];
    close(true);
    if (item !== undefined && item.value !== value) onChange(item.value);
  }

  function handleTriggerClick() {
    if (loading) return;
    if (expanded) {
      close(false);
    } else {
      openAt(Math.max(selectedIndex, 0));
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (loading || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    openAt(Math.max(selectedIndex, 0));
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.nativeEvent.isComposing) return;
    const last = items.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(Math.min(activeIndex + 1, last));
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(Math.max(activeIndex - 1, 0));
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0) choose(activeIndex);
        return;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      case 'Tab':
        close(false);
        return;
      default:
    }
  }

  function handleListBlur(event: FocusEvent<HTMLUListElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && rootRef.current?.contains(next)) return;
    setOpen(false);
  }

  const content =
    selected === undefined ? null : (
      <>
        <Avatar item={selected} stack={companies} />
        <Details item={selected} />
      </>
    );

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      {interactive ? (
        <button
          ref={setTriggerRef}
          type="button"
          className={styles.trigger}
          disabled={disabled}
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          aria-label={selected === undefined ? label : `${label}: ${selected.name}`}
          aria-haspopup="listbox"
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          {content}
          {loading ? (
            <Icon name="loader" size="sm" className={styles.spinner} />
          ) : (
            <Icon name="chevronDown" size="sm" className={styles.chevron} />
          )}
        </button>
      ) : (
        <div className={cn(styles.trigger, styles.static)}>{content}</div>
      )}
      {expanded && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}

          tabIndex={-1}
          className={styles.menu}

          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onKeyDown={handleListKeyDown}
          onBlur={handleListBlur}
        >
          {items.map((item, index) => (
            <li
              key={item.value ?? 'all'}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(styles.option, index === activeIndex && styles.active)}
              onClick={() => {
                choose(index);
              }}
              onPointerMove={() => {
                if (index !== activeIndex) setActiveIndex(index);
              }}
            >
              <Avatar item={item} stack={companies} />
              <Details item={item} />
              {index === selectedIndex && <Icon name="check" size="sm" className={styles.check} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
