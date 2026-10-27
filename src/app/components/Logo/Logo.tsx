import cn from 'classnames';

import { LOGO_MARK_BG_PATH, LOGO_MARK_GLYPH_PATH } from './glyph';
import styles from './Logo.module.scss';

export type LogoSize = 'sm' | 'md';

export interface LogoProps {
  size?: LogoSize;

  wordmark?: boolean;
  className?: string;
}

const BRAND_NAME = 'Альфа-Бизнес';

export function Logo({ size = 'md', wordmark = true, className }: LogoProps) {
  return (
    <span role="img" aria-label={BRAND_NAME} className={cn(styles.root, styles[size], className)}>
      <svg className={styles.mark} viewBox="2 2 20 20" aria-hidden="true">
        <path className={styles.markBg} d={LOGO_MARK_BG_PATH} />
        <path className={styles.markGlyph} d={LOGO_MARK_GLYPH_PATH} fillRule="evenodd" />
      </svg>
      {wordmark && (
        <span className={styles.wordmark} aria-hidden="true">
          {BRAND_NAME}
        </span>
      )}
    </span>
  );
}
