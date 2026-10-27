import cn from 'classnames';

import type { ClaimKind } from 'types/models';
import { pickOwn } from 'utils/pickOwn';

import styles from './OriginLabel.module.scss';

export interface OriginLabelProps {
  kind: ClaimKind;
  className?: string;
}

const LABEL: Partial<Record<string, string>> = {
  fact: 'Факт',
  bank_view: 'Позиция Альфа-Банка',
  ai_conclusion: 'Вывод ИИ',
};

const KIND_CLASS: Partial<Record<string, string>> = {
  fact: styles.fact,
  bank_view: styles.bankView,
  ai_conclusion: styles.aiConclusion,
};

export function OriginLabel({ kind, className }: OriginLabelProps) {
  return (
    <span className={cn(styles.root, pickOwn(KIND_CLASS, kind, styles.aiConclusion), className)}>
      {pickOwn(LABEL, kind, 'Вывод ИИ')}
    </span>
  );
}
