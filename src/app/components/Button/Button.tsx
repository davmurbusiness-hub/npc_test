import cn from 'classnames';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { Text } from 'components/Text';

import styles from './Button.module.scss';

import type { ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  type = 'button',
  onClick,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      onClick={loading ? undefined : onClick}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(styles.root, styles[variant], styles[size], className)}
    >
      {loading ? <Icon name="loader" size={size} /> : icon && <Icon name={icon} size={size} />}
      <Text as="span" size={size} weight="medium" color="inherit" className={styles.label}>
        {children}
      </Text>
      {iconEnd && <Icon name={iconEnd} size={size} />}
    </button>
  );
}
