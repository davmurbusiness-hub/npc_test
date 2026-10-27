import cn from 'classnames';

import { Icon } from 'components/Icon';
import type { IconName, IconSize } from 'components/Icon';

import styles from './IconButton.module.scss';

import type { ComponentPropsWithRef, MouseEvent } from 'react';

export type IconButtonVariant = 'ghost' | 'secondary';
export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label' | 'aria-labelledby' | 'title'
> {
  icon: IconName;

  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;

  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const ICON_SIZE: Readonly<Record<IconButtonSize, IconSize>> = { sm: 'sm', md: 'md' };

function blockClick(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  onClick,
  ...rest
}: IconButtonProps) {
  const blocked = rest['aria-disabled'] === true || rest['aria-disabled'] === 'true';

  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      aria-labelledby={undefined}
      title={label}
      className={cn(styles.root, styles[variant], styles[size], className)}
      onClick={blocked ? blockClick : onClick}
    >
      <Icon name={icon} size={ICON_SIZE[size]} />
    </button>
  );
}
