import cn from 'classnames';

import { Button } from 'components/Button';
import { EmptyState } from 'components/EmptyState';
import { IconButton } from 'components/IconButton';
import { StatusAnnouncer } from 'components/StatusAnnouncer';
import type { CitizenId } from 'types/common';
import type { CitizenPreview as CitizenPreviewData } from 'types/entities';
import { fullNameOf } from 'utils/format';

import styles from './CitizenPreview.module.scss';
import { PreviewDetails } from './PreviewDetails';
import { PreviewSkeleton } from './PreviewSkeleton';

export type CitizenPreviewState =
  | { status: 'idle' }
  | { status: 'loading'; id: CitizenId }
  | { status: 'ready'; id: CitizenId; preview: CitizenPreviewData }
  | { status: 'error'; id: CitizenId; message: string };

export interface CitizenPreviewProps {
  state: CitizenPreviewState;
  cardHref: string | null;
  onClose: () => void;
  onRetry: () => void;
  className?: string;
}

function announcementOf(state: CitizenPreviewState): string | null {
  if (state.status === 'ready') return fullNameOf(state.preview.citizen);
  if (state.status === 'error') return 'Не удалось загрузить сведения о гражданине';
  return null;
}

export function CitizenPreview({
  state,
  cardHref,
  onClose,
  onRetry,
  className,
}: CitizenPreviewProps) {
  return (
    <aside
      aria-label="Сведения о гражданине"
      aria-busy={state.status === 'loading' || undefined}
      className={cn(styles.root, className)}
    >
      <StatusAnnouncer message={announcementOf(state)} />
      {renderBody(state, cardHref, onClose, onRetry)}
    </aside>
  );
}

function renderBody(
  state: CitizenPreviewState,
  cardHref: string | null,
  onClose: () => void,
  onRetry: () => void
) {
  switch (state.status) {
    case 'idle':
      return (
        <EmptyState
          title="Гражданин не выбран"
          description="Выберите гражданина в списке, чтобы увидеть сведения"
          className={styles.placeholder}
        />
      );
    case 'loading':
      return <PreviewSkeleton key={state.id} onClose={onClose} />;
    case 'error':
      return (
        <div key={state.id} className={styles.content}>
          <div className={styles.toolbar}>
            <IconButton icon="close" label="Закрыть превью" onClick={onClose} />
          </div>
          <EmptyState
            title="Не удалось загрузить сведения"
            description={state.message}
            action={<Button onClick={onRetry}>Повторить</Button>}
          />
        </div>
      );
    case 'ready':
      return (
        <PreviewDetails
          key={state.id}
          preview={state.preview}
          cardHref={cardHref}
          onClose={onClose}
        />
      );
  }
}
