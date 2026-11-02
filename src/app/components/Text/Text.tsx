import cn from 'classnames';

import styles from './Text.module.scss';

import type { HTMLAttributes } from 'react';

export type TextTag =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'strong'
  | 'em'
  | 'small'
  | 'li'
  | 'dt'
  | 'dd'
  | 'figcaption';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'inherit';

export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverted'
  | 'link'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'accent'
  | 'inherit';

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  as?: TextTag;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  truncate?: boolean;
  htmlFor?: string;
}

const SIZE_CLASS: Record<TextSize, string | undefined> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  '2xl': styles.xl2,
  '3xl': styles.xl3,
  '4xl': styles.xl4,
  inherit: styles.inheritSize,
};

export function Text({
  as: Tag = 'p',
  size = 'md',
  color = 'primary',
  weight = 'regular',
  truncate = false,
  className,
  ...rest
}: TextProps) {
  return (
    <Tag
      {...rest}
      className={cn(
        styles.root,
        SIZE_CLASS[size],
        styles[color],
        styles[weight],
        truncate && styles.truncate,
        className
      )}
    />
  );
}
