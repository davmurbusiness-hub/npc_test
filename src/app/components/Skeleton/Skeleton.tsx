import cn from 'classnames';

import styles from './Skeleton.module.scss';

import type { CSSProperties } from 'react';

export type SkeletonShape = 'text' | 'block' | 'circle';
export type SkeletonHeight = 'sm' | 'md' | 'lg';

export interface SkeletonProps {
  shape?: SkeletonShape;

  lines?: number;

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

const MAX_LINES = 20;

function toLineCount(lines: number): number {
  if (!Number.isFinite(lines)) return 1;
  return Math.min(MAX_LINES, Math.max(1, Math.floor(lines)));
}

export function Skeleton({
  shape = 'text',
  lines = 1,
  width = '100%',
  height,
  className,
}: SkeletonProps) {
  if (shape === 'text') {
    return (
      <div
        aria-hidden="true"
        className={cn(styles.root, styles.text, className)}
        style={widthStyle(width)}
      >
        {Array.from({ length: toLineCount(lines) }, (_, index) => (
          <span key={index} className={styles.line} />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        styles.root,
        styles[shape],
        HEIGHT_CLASS[height ?? DEFAULT_HEIGHT[shape]],
        className
      )}
      style={shape === 'block' ? widthStyle(width) : undefined}
    />
  );
}
