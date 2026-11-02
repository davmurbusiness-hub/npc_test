import cn from 'classnames';

import { Badge } from 'components/Badge';
import type { BadgeTone } from 'components/Badge';
import type { ActionQueueItem } from 'types/dashboard';
import type { DeadlineTone } from 'types/dictionaries';
import { ACTION_QUEUE_LABELS, DEADLINE_TONE_LABELS } from 'utils/ui';

import { CountLink } from '../CountLink';
import styles from './ActionQueue.module.scss';

export interface ActionQueueProps {
  items: readonly ActionQueueItem[];
  className?: string;
}

const BADGE_TONE: Readonly<Record<Exclude<DeadlineTone, 'none'>, BadgeTone>> = {
  soon: 'warning',
  overdue: 'negative',
};

export function ActionQueue({ items, className }: ActionQueueProps) {
  return (
    <ul className={cn(styles.root, className)}>
      {items.map((item) => {
        const label = ACTION_QUEUE_LABELS[item.kind];
        return (
          <li key={item.kind} className={cn(styles.item, styles[item.tone])}>
            <span className={styles.label}>{label}</span>
            {item.tone !== 'none' && (
              <Badge tone={BADGE_TONE[item.tone]}>{DEADLINE_TONE_LABELS[item.tone]}</Badge>
            )}
            <CountLink count={item.count} link={item.link} label={label} className={styles.count} />
          </li>
        );
      })}
    </ul>
  );
}
