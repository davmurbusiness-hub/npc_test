import cn from 'classnames';

import type { BadgeTone } from 'types/ui';

import styles from './Badge.module.scss';

import type { ComponentProps } from 'react';

export interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...rest }: BadgeProps) {
  return <span {...rest} className={cn(styles.root, styles[tone], className)} />;
}
