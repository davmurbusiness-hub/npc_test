import { Button, ButtonLink } from 'components/Button';
import { EmptyState } from 'components/EmptyState';
import { Skeleton } from 'components/Skeleton';

import { PATHS } from 'config/paths';

import styles from './CardStates.module.scss';

export function CardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.header}>
        <Skeleton shape="circle" height="lg" />
        <div className={styles.lines}>
          <Skeleton width="40%" />
          <Skeleton width="25%" />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.lines}>
          <Skeleton width="80%" />
          <Skeleton width="70%" />
          <Skeleton width="75%" />
          <Skeleton width="60%" />
        </div>
        <Skeleton shape="block" height="lg" />
      </div>
    </div>
  );
}

export function CardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <EmptyState
      title="Не удалось загрузить карточку"
      description={message}
      action={<Button onClick={onRetry}>Повторить</Button>}
    />
  );
}

export function CardNotFound() {
  return (
    <EmptyState
      title="Карточка не найдена"
      description="Такого гражданина нет в картотеке. Проверьте адрес или найдите человека в списке."
      action={
        <ButtonLink to={PATHS.registry} variant="primary" icon="arrowLeft">
          К списку
        </ButtonLink>
      }
    />
  );
}
