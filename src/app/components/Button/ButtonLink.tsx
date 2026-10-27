import cn from 'classnames';
import { Link } from 'react-router';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { Text } from 'components/Text';

import styles from './Button.module.scss';

import type { ButtonSize, ButtonVariant } from './Button';
import type { MouseEvent, ReactNode } from 'react';

export interface ButtonLinkProps {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;

  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  icon,
  onClick,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(styles.root, styles.link, styles[variant], styles[size], className)}
    >
      {icon && <Icon name={icon} size={size} />}
      <Text
        as="span"
        size={size}
        weight="medium"
        color="inherit"
        wrap="normal"
        className={styles.label}
      >
        {children}
      </Text>
    </Link>
  );
}
