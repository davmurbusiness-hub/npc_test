import cn from 'classnames';
import { createElement } from 'react';

import { pickOwn } from 'utils/pickOwn';

import * as GLYPHS from './glyphs';
import styles from './Icon.module.scss';

import type { GlyphNode } from './glyphs/types';

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

const registry: Partial<Record<string, readonly GlyphNode[]>> = GLYPHS;

const NO_NODES: readonly GlyphNode[] = [];

const SPINNING: ReadonlySet<string> = new Set<IconName>(['loader']);

const COLOR_CLASS: Partial<Record<string, string>> = {
  primary: styles.primary,
  secondary: styles.secondary,
  tertiary: styles.tertiary,
  inverted: styles.inverted,
  link: styles.link,
  positive: styles.positive,
  negative: styles.negative,
  warning: styles.warning,
  info: styles.info,
};

export function Icon({ name, size = 'md', color = 'inherit', className }: IconProps) {
  const nodes = pickOwn(registry, name, NO_NODES);

  return (
    <svg
      className={cn(
        styles.root,
        styles[size],
        pickOwn(COLOR_CLASS, color, undefined),
        SPINNING.has(name) && styles.spin,
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
      {nodes.map(([tag, attrs], index) => createElement(tag, { key: index, ...attrs }))}
    </svg>
  );
}
