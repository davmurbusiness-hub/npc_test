import cn from 'classnames';
import { useState } from 'react';

import { initialOf } from 'utils/initialOf';

import styles from './Avatar.module.scss';

export type AvatarSize = 'sm' | 'lg';

export interface AvatarProps {
  name: string;

  src?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ name, src, size = 'sm', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const showImage = src !== undefined && src !== failedSrc;

  return (
    <span aria-hidden="true" className={cn(styles.root, styles[size], className)}>
      {initialOf(name)}
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt=""
          decoding="async"
          onError={() => {
            setFailedSrc(src);
          }}
        />
      ) : null}
    </span>
  );
}
