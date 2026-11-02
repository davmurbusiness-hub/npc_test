import cn from 'classnames';
import { createElement } from 'react';

import * as GLYPHS from './glyphs';
import styles from './Icon.module.scss';

export type IconName = keyof typeof GLYPHS;

export type IconSize = 'sm' | 'md' | 'lg';

export type IconColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverted'
  | 'link'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info'
  | 'inherit';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  color?: IconColor;
  className?: string;
}

export function Icon({ name, size = 'md', color = 'inherit', className }: IconProps) {
  return (
    <svg
      className={cn(
        styles.root,
        styles[size],
        color !== 'inherit' && styles[color],
        name === 'loader' && styles.spin,
        className
      )}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name].map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  );
}
