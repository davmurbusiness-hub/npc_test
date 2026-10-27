import cn from 'classnames';

import { Text } from 'components/Text';

import styles from './OfferCard.module.scss';

export type OfferCardKind = 'ad' | 'news' | 'important' | 'info';

export interface OfferCardProps {
  kind?: OfferCardKind;

  title: string;

  description: string;

  kicker?: string;

  descriptionLabel?: string;
  className?: string;
}

interface KindConfig {
  label: string;
  kicker?: string;
  descriptionLabel?: string;
  className: string | undefined;
}

const KINDS: Record<OfferCardKind, KindConfig> = {
  ad: {
    label: 'Реклама',
    kicker: 'Продукт Альфа-Банка',
    descriptionLabel: 'Почему предлагаем:',
    className: styles.ad,
  },
  news: { label: 'Новость', className: styles.news },
  important: { label: 'Важно', className: styles.important },
  info: { label: 'К сведению', className: styles.info },
};

export function OfferCard({
  kind = 'ad',
  title,
  description,
  kicker,
  descriptionLabel,
  className,
}: OfferCardProps) {
  const config = KINDS[kind];
  const shownKicker = kicker ?? config.kicker;
  const shownDescriptionLabel = descriptionLabel ?? config.descriptionLabel;

  return (
    <aside
      aria-label={`${config.label}: ${title}`}
      className={cn(styles.root, config.className, className)}
    >
      <div className={styles.header}>
        <span className={styles.label}>{config.label}</span>
        {shownKicker && (
          <Text as="span" size="xs" color="secondary" wrap="normal">
            {shownKicker}
          </Text>
        )}
      </div>
      <Text as="p" weight="semibold" wrap="normal">
        {title}
      </Text>
      <Text as="p" size="sm" wrap="normal">
        {shownDescriptionLabel && (
          <Text as="span" size="sm" color="secondary" weight="medium" wrap="normal">
            {shownDescriptionLabel}{' '}
          </Text>
        )}
        {description}
      </Text>
    </aside>
  );
}
