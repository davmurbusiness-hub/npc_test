import cn from 'classnames';
import { Link } from 'react-router';

import type { Drilldown } from 'types/registry';
import { formatCount } from 'utils/format';
import { drilldownSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import styles from './CountLink.module.scss';

export type CountLinkTone = 'default' | 'negative';

export interface CountLinkProps {
  count: number;
  link: Drilldown;
  label: string;
  children?: string;
  tone?: CountLinkTone;
  className?: string;
}

export function CountLink({
  count,
  link,
  label,
  children,
  tone = 'default',
  className,
}: CountLinkProps) {
  const text = children ?? formatCount(count);
  const toneClass = tone === 'negative' && styles.negative;
  if (count === 0) return <span className={cn(styles.value, className)}>{text}</span>;
  return (
    <Link
      to={`${PATHS.registry}${drilldownSearch(link)}`}
      aria-label={`${label}: ${text}, открыть в картотеке`}
      className={cn(styles.value, styles.link, toneClass, className)}
    >
      {text}
    </Link>
  );
}
