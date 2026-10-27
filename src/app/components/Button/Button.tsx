import cn from 'classnames';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { Text } from 'components/Text';
import type { TextSize } from 'components/Text';

import styles from './Button.module.scss';

import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-busy'
> {
  variant?: ButtonVariant;
  size?: ButtonSize;

  icon?: IconName;

  iconEnd?: IconName;

  loading?: boolean;

  type?: 'button' | 'submit' | 'reset';

  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  'aria-pressed'?: ComponentPropsWithRef<'button'>['aria-pressed'];

  'aria-disabled'?: ComponentPropsWithRef<'button'>['aria-disabled'];
  className?: string;
  children: ReactNode;
}

const TEXT_SIZE: Readonly<Record<ButtonSize, TextSize>> = { sm: 'sm', md: 'md', lg: 'lg' };

function blockClick(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  type = 'button',
  className,
  children,
  onClick,
  'aria-disabled': ariaDisabled,
  ...rest
}: ButtonProps) {
  const pressed = rest['aria-pressed'] === true || rest['aria-pressed'] === 'true';
  const blocked = loading || ariaDisabled === true || ariaDisabled === 'true';

  return (
    <button
      {...rest}
      type={type}
      className={cn(styles.root, styles[variant], styles[size], className)}
      aria-disabled={blocked || undefined}
      aria-busy={loading || undefined}
      onClick={blocked ? blockClick : onClick}
    >
      {loading ? <Icon name="loader" size={size} /> : icon && <Icon name={icon} size={size} />}
      <Text
        as="span"
        size={TEXT_SIZE[size]}
        weight={pressed ? 'semibold' : 'medium'}
        color="inherit"
        wrap="normal"
        className={styles.label}
      >
        {children}
      </Text>
      {iconEnd && <Icon name={iconEnd} size={size} />}
    </button>
  );
}
