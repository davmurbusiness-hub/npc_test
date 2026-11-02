import cn from 'classnames';
import { useId } from 'react';

import { Text } from 'components/Text';
import { useFieldDescription } from 'hooks/ui';

import styles from './Switch.module.scss';

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ label, checked, onChange, hint, disabled, className }: SwitchProps) {
  const id = useId();
  const { showHint, hintId, describedBy } = useFieldDescription({ hint });

  return (
    <div className={cn(styles.root, disabled && styles.disabled, className)}>
      <span className={styles.control}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          aria-describedby={describedBy}
          onChange={(event) => {
            onChange(event.target.checked);
          }}
          className={styles.input}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
      <span className={styles.text}>
        <Text as="label" htmlFor={id} size="sm" className={styles.label}>
          {label}
        </Text>
        {showHint && (
          <Text as="span" id={hintId} size="xs" color="tertiary">
            {hint}
          </Text>
        )}
      </span>
    </div>
  );
}
