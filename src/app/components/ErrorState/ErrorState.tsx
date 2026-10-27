import cn from 'classnames';

import { Button } from 'components/Button';
import { Text } from 'components/Text';
import { textOrNull } from 'utils/textOrNull';

import styles from './ErrorState.module.scss';

export interface ErrorStateProps {
  title?: string;

  description?: string;

  onRetry: () => void;

  loading?: boolean;
  className?: string;
}

const DEFAULT_TITLE = 'Не удалось загрузить данные';

export function ErrorState({
  title,
  description,
  onRetry,
  loading = false,
  className,
}: ErrorStateProps) {
  const reason = textOrNull(description);

  return (
    <div className={cn(styles.root, className)} role="alert">
      <Text size="md" weight="semibold" wrap="normal">
        {textOrNull(title) ?? DEFAULT_TITLE}
      </Text>
      {reason !== null && (
        <Text size="sm" color="secondary" wrap="normal" className={styles.description}>
          {reason}
        </Text>
      )}
      <Button
        className={styles.retry}
        variant="secondary"
        icon="refresh"
        loading={loading}
        onClick={() => {
          onRetry();
        }}
      >
        Повторить
      </Button>
    </div>
  );
}
