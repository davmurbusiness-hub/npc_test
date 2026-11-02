import cn from 'classnames';
import { Link } from 'react-router';

import { Icon } from 'components/Icon';
import type { IconName } from 'components/Icon';
import { Text } from 'components/Text';

import styles from './Button.module.scss';

import type { ButtonSize, ButtonVariant } from './Button';
import type { LinkProps } from 'react-router';

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      className={cn(styles.root, styles.link, styles[variant], styles[size], className)}
    >
      {icon && <Icon name={icon} size={size} />}
      <Text as="span" size={size} weight="medium" color="inherit" className={styles.label}>
        {children}
      </Text>
    </Link>
  );
}
