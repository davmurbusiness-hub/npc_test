import cn from 'classnames';
import { useId } from 'react';

import { Card } from 'components/Card';
import { ErrorState } from 'components/ErrorState';
import { Text } from 'components/Text';
import type { Block } from 'types/models';

import styles from './AsyncBlock.module.scss';

import type { ReactNode } from 'react';

export type AsyncBlockFrame = 'card' | 'section';

export interface AsyncBlockProps<P> {
  block: Block<P>;

  title: string;

  skeleton: ReactNode;
  frame?: AsyncBlockFrame;

  className?: string;

  children: (props: P) => ReactNode;
}

export function AsyncBlock<P>({
  block,
  title,
  skeleton,
  frame = 'card',
  className,
  children,
}: AsyncBlockProps<P>) {
  const titleId = useId();
  const loading = block.status === 'loading';
  const content =
    block.status === 'ready' ? (
      children(block.data)
    ) : loading ? (
      skeleton
    ) : (
      <ErrorState onRetry={block.onRetry} />
    );

  if (frame === 'section') {
    return (
      <section
        aria-labelledby={titleId}
        aria-busy={loading || undefined}
        className={cn(styles.section, className)}
      >
        <Text as="h2" id={titleId} size="xl" weight="semibold" wrap="normal">
          {title}
        </Text>
        {content}
      </section>
    );
  }

  return (
    <div className={cn(styles.card, className)}>
      {block.status === 'ready' ? (
        content
      ) : (
        <Card title={title} aria-busy={loading || undefined}>
          {content}
        </Card>
      )}
    </div>
  );
}
