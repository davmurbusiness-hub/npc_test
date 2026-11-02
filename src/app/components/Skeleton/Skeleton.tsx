import cn from 'classnames';

import styles from './Skeleton.module.scss';

import type { CSSProperties } from 'react';

export type SkeletonShape = 'text' | 'block' | 'circle';
export type SkeletonHeight = 'sm' | 'md' | 'lg';

export interface SkeletonProps {
  shape?: SkeletonShape;

  width?: `${number}%`;

  height?: SkeletonHeight;
  className?: string;
}

type WidthStyle = CSSProperties & { '--skeleton-width': string };

const HEIGHT_CLASS: Record<SkeletonHeight, string | undefined> = {
  sm: styles.heightSm,
  md: styles.heightMd,
  lg: styles.heightLg,
};

const DEFAULT_HEIGHT: Record<Exclude<SkeletonShape, 'text'>, SkeletonHeight> = {
  block: 'lg',
  circle: 'md',
};

function widthStyle(width: string): WidthStyle {
  return { '--skeleton-width': width };
}

export function Skeleton({ shape = 'text', width = '100%', height, className }: SkeletonProps) {
  const heightClass = shape === 'text' ? undefined : HEIGHT_CLASS[height ?? DEFAULT_HEIGHT[shape]];

  return (
    <div
      aria-hidden="true"
      className={cn(styles.root, styles[shape], heightClass, className)}
      style={shape === 'circle' ? undefined : widthStyle(width)}
    />
  );
}
