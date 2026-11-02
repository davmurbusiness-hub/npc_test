import { IconButton } from 'components/IconButton';
import { Skeleton } from 'components/Skeleton';

import styles from './CitizenPreview.module.scss';

const ROW_WIDTHS = ['70%', '45%', '60%', '80%', '50%', '65%'] as const;

export function PreviewSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <Skeleton shape="circle" height="lg" />
        <div className={styles.identity}>
          <Skeleton width="80%" />
          <Skeleton width="45%" className={styles.skeletonMeta} />
        </div>
        <IconButton icon="close" label="Закрыть превью" onClick={onClose} />
      </div>
      <Skeleton shape="block" height="md" />
      <div className={styles.section}>
        <Skeleton width="40%" />
        {ROW_WIDTHS.map((width, index) => (
          <Skeleton key={index} width={width} />
        ))}
      </div>
    </div>
  );
}
