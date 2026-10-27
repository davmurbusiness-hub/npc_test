import cn from 'classnames';
import { useId } from 'react';

import { Text } from 'components/Text';
import type { Source, SourceOrigin } from 'types/models';
import { pickOwn } from 'utils/pickOwn';

import { SourceLink } from './SourceLink';
import styles from './SourceList.module.scss';

export interface SourceListProps {
  sources: readonly Source[];

  hideTitle?: boolean;
  className?: string;
}

const ORIGIN = {
  news: 'Новость',
  alfa_analytics: 'Аналитика Альфа-Банка',
  company_data: 'Данные компании',
} satisfies Record<SourceOrigin, string>;

const UNKNOWN_ORIGIN = 'Источник';

export function SourceList({ sources, hideTitle = false, className }: SourceListProps) {
  const titleId = useId();

  return (
    <div className={cn(styles.root, className)}>
      <Text
        as="p"
        id={titleId}
        size="sm"
        weight="semibold"
        wrap="normal"
        className={hideTitle ? styles.srOnly : undefined}
      >
        Источники
      </Text>
      {sources.length > 0 ? (
        <ul className={styles.list} role="list" aria-labelledby={titleId}>
          {sources.map((source, index) => (
            <Text
              as="li"
              size="sm"
              wrap="normal"
              className={styles.item}
              key={`${source.id}:${index}`}
            >
              <Text as="span" size="xs" color="tertiary" wrap="nowrap">
                {pickOwn(ORIGIN, source.origin, UNKNOWN_ORIGIN)}
              </Text>
              <SourceLink source={source} />
            </Text>
          ))}
        </ul>
      ) : (
        <Text as="p" size="sm" color="warning" wrap="normal">
          Источники не указаны
        </Text>
      )}
    </div>
  );
}
