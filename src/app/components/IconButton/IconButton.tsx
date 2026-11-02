import cn from 'classnames';

import { Icon } from 'components/Icon';
import type { IconName, IconSize } from 'components/Icon';

import styles from './IconButton.module.scss';

import type { ComponentProps } from 'react';

export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName;
  label: string;
  size?: IconSize;
}

export function IconButton({
  icon,
  label,
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={label}
      className={cn(styles.root, styles[size], className)}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
