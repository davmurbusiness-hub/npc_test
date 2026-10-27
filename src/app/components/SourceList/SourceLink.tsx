import cn from 'classnames';

import { Badge } from 'components/Badge';
import { Icon } from 'components/Icon';
import { Text } from 'components/Text';
import type { Source } from 'types/models';
import { toHttpHref } from 'utils/toHttpHref';

import styles from './SourceLink.module.scss';

export interface SourceLinkProps {
  source: Source;
  className?: string;
}

const UNTITLED = 'Источник без названия';

export function SourceLink({ source, className }: SourceLinkProps) {
  const { title, url, synthetic } = source;
  const label = title.trim() === '' ? UNTITLED : title;
  const href = url === null ? null : toHttpHref(url);

  return (
    <span className={cn(styles.root, className)}>
      {href === null ? (
        <Text as="span" size="inherit" wrap="normal">
          {label}
        </Text>
      ) : (
        <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
          {label}
          <Icon className={styles.icon} name="externalLink" size="sm" />
          <span className={styles.srOnly}>, откроется в новой вкладке</span>
        </a>
      )}
      {synthetic && (
        <Badge className={styles.badge} tone="neutral">
          синтетическая
        </Badge>
      )}
    </span>
  );
}
