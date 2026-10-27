import cn from 'classnames';
import { useId } from 'react';

import styles from './Star.module.scss';

export interface StarProps {
  className?: string;
}

const STAR_PATH = 'M50 0C53 31 69 47 100 50C69 53 53 69 50 100C47 69 31 53 0 50C31 47 47 31 50 0Z';

export function Star({ className }: StarProps) {
  const gradientId = useId();

  return (
    <svg
      className={cn(styles.root, className)}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--color-hero-star-light)" />
          <stop offset="55%" stopColor="var(--color-hero-star)" />
          <stop offset="100%" stopColor="var(--color-hero-star-dark)" />
        </radialGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${gradientId})`} />
    </svg>
  );
}
