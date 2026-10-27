import cn from 'classnames';

import { Button } from 'components/Button';
import type { QuickActionKind } from 'types/models';

import styles from './QuickActions.module.scss';

export interface QuickActionsProps {
  onAction: (kind: QuickActionKind) => void;

  disabled?: boolean;

  disabledKinds?: readonly QuickActionKind[];
  className?: string;
}

const NO_KINDS: readonly QuickActionKind[] = [];

const LABEL = {
  clarify: 'Уточнить',
  other_cut: 'Другой разрез',
  primary_source: 'Первоисточник',
  next_step: 'Следующее действие',
} satisfies Record<QuickActionKind, string>;

function isQuickActionKind(key: string): key is QuickActionKind {
  return Object.hasOwn(LABEL, key);
}

const KINDS = Object.keys(LABEL).filter(isQuickActionKind);

export function QuickActions({
  onAction,
  disabled = false,
  disabledKinds = NO_KINDS,
  className,
}: QuickActionsProps) {
  return (
    <div role="group" aria-label="Быстрые действия" className={cn(styles.root, className)}>
      {KINDS.map((kind) => (
        <Button
          key={kind}
          variant="secondary"
          size="sm"
          disabled={disabled || disabledKinds.includes(kind)}
          onClick={() => {
            onAction(kind);
          }}
        >
          {LABEL[kind]}
        </Button>
      ))}
    </div>
  );
}
