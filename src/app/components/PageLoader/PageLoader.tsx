import cn from 'classnames';
import { useEffect, useState } from 'react';

import styles from './PageLoader.module.scss';

export interface PageLoaderProps {
  label?: string;

  fullscreen?: boolean;
  className?: string;
}

const CYCLE_MS = 4400;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const GLYPH_A_PATH =
  'M38.0053 72.6339L53.8534 25.7637H54.4398L69.408 72.6339H38.0053ZM74.6838 17.1114C71.4627 7.55143 67.75 0 55.0268 0C42.3038 0 38.3528 7.52038 34.961 17.1114L0 116H23.1844L31.2552 92.4906H75.8644L83.3479 116H108L74.6838 17.1114Z';

const GLYPH_D_PATH =
  'M0 108H38.3104C67.8902 108 89 88.8338 89 54C89 18.5578 67.8902 0 38.3104 0H0V108ZM37.9195 22.2085C54.9897 22.2085 66.4568 33.1606 66.4568 54C66.4568 74.0789 54.9897 85.7916 37.9195 85.7916H22.1523V22.2085H37.9195Z';

const BRICK_PATH = 'M0 159h108v-22H0v22z';

function MarkParts({ active }: { active: boolean }) {
  return (
    <g className={cn(styles.set, active && styles.active)}>
      <path className={styles.glyphA} fillRule="evenodd" clipRule="evenodd" d={GLYPH_A_PATH} />
      <path className={styles.glyphD} d={GLYPH_D_PATH} />
      <g className={styles.brick}>
        <path className={styles.brickRotate} fillRule="evenodd" clipRule="evenodd" d={BRICK_PATH} />
      </g>
      <line className={styles.line} x1="0" y1="179" x2="108" y2="179" />
      <line className={styles.verticalLine} x1="-15" y1="0" x2="-15" y2="180" />
    </g>
  );
}

export function PageLoader({ label = 'Загрузка', fullscreen = true, className }: PageLoaderProps) {
  const [second, setSecond] = useState(false);

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return undefined;
    const id = window.setInterval(() => setSecond((value) => !value), CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(styles.root, fullscreen && styles.fullscreen, className)}
    >
      <svg className={styles.icon} viewBox="-36 0 180 180" fill="none" aria-hidden="true">
        <MarkParts active={!second} />
        <MarkParts active={second} />
      </svg>
    </div>
  );
}
