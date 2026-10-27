import cn from 'classnames';

import { Text } from 'components/Text';

import styles from './RichText.module.scss';

import type { ReactNode } from 'react';

export interface RichTextProps {
  text: string;
  className?: string;
}

type Block = { type: 'p'; lines: string[] } | { type: 'ul' | 'ol'; items: string[] };

const BULLET = /^[-*+][ \t]+/;
const NUMBERED = /^\d{1,2}[.)][ \t]+/;

const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const last = blocks.at(-1);
    if (line === '') {
      blocks.push({ type: 'p', lines: [] });
      continue;
    }
    const type = BULLET.test(line) ? 'ul' : NUMBERED.test(line) ? 'ol' : null;
    if (type !== null) {
      const item = line.replace(type === 'ul' ? BULLET : NUMBERED, '');
      if (last?.type === type) last.items.push(item);
      else blocks.push({ type, items: [item] });
    } else if (last?.type === 'p') {
      last.lines.push(line);
    } else {
      blocks.push({ type: 'p', lines: [line] });
    }
  }
  return blocks.filter((block) =>
    block.type === 'p' ? block.lines.length > 0 : block.items.length > 0
  );
}

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function RichText({ text, className }: RichTextProps) {
  return (
    <div className={cn(styles.root, className)}>
      {parse(text).map((block, index) => {
        if (block.type === 'p') {
          return (
            <Text as="p" size="md" wrap="normal" key={index}>
              {inline(block.lines.join(' '))}
            </Text>
          );
        }
        const List = block.type;
        return (
          <List className={styles.list} role="list" key={index}>
            {block.items.map((item, itemIndex) => (
              <Text as="li" size="md" wrap="normal" key={`${itemIndex}:${item}`}>
                {inline(item)}
              </Text>
            ))}
          </List>
        );
      })}
    </div>
  );
}
