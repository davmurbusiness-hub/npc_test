import { useId } from 'react';

import { labelOf } from 'api/dictionaries';
import { Avatar } from 'components/Avatar';
import { Badge } from 'components/Badge';
import { ButtonLink } from 'components/Button';
import { IconButton } from 'components/IconButton';
import { KeyValueList } from 'components/KeyValueList';
import type { KeyValueItem } from 'components/KeyValueList';
import { Text } from 'components/Text';
import type { Address, CitizenPreview } from 'types/entities';
import { addressText } from 'utils/citizen';
import { formatIsoDate, formatYears, fullNameOf, textOrNull } from 'utils/format';
import { formatMasked } from 'utils/masks';
import { STATUS_TONE } from 'utils/ui';

import styles from './CitizenPreview.module.scss';

interface PreviewDetailsProps {
  preview: CitizenPreview;
  cardHref: string | null;
  onClose: () => void;
}

export function PreviewDetails({ preview, cardHref, onClose }: PreviewDetailsProps) {
  const { citizen, addresses } = preview;
  const fullName = fullNameOf(citizen);
  const baseId = useId();
  const mainId = `${baseId}-main`;
  const addressesId = `${baseId}-addresses`;

  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <Avatar name={fullName} size="lg" />
        <div className={styles.identity}>
          <Text as="h2" size="lg" weight="semibold" className={styles.name}>
            {fullName}
          </Text>
          <div className={styles.meta}>
            <Text as="span" size="sm" color="secondary">
              № {citizen.cardNumber}
            </Text>
            <Badge tone={STATUS_TONE[citizen.status]}>
              {labelOf('cardStatus', citizen.status)}
            </Badge>
          </div>
        </div>
        <IconButton icon="close" label="Закрыть превью" onClick={onClose} />
      </header>

      {cardHref !== null && (
        <ButtonLink to={cardHref} variant="primary" icon="externalLink" className={styles.open}>
          Открыть карточку
        </ButtonLink>
      )}

      <section className={styles.section} aria-labelledby={mainId}>
        <Text as="h3" id={mainId} size="md" weight="semibold">
          Основные сведения
        </Text>
        <KeyValueList items={mainItems(citizen)} />
      </section>

      <section className={styles.section} aria-labelledby={addressesId}>
        <SectionTitle id={addressesId} title="Адреса" count={addresses.length} />
        {addresses.length === 0 ? (
          <Text size="sm" color="secondary">
            Адресов нет
          </Text>
        ) : (
          <ul className={styles.list}>
            {addresses.map((address) => (
              <AddressItem key={address.id} address={address} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <Text as="h3" id={id} size="md" weight="semibold" className={styles.sectionTitle}>
      {title}
      <Text as="span" size="sm" color="tertiary" weight="regular">
        {count}
      </Text>
    </Text>
  );
}

function mainItems(citizen: CitizenPreview['citizen']): KeyValueItem[] {
  const phone = citizen.mobilePhone;
  const email = textOrNull(citizen.email);

  return [
    {
      id: 'birthDate',
      label: 'Дата рождения',
      value: `${formatIsoDate(citizen.birthDate)}, ${formatYears(citizen.age)}`,
    },
    { id: 'gender', label: 'Пол', value: textOrNull(labelOf('gender', citizen.gender)) },
    {
      id: 'mobilePhone',
      label: 'Мобильный',
      value:
        phone === null ? null : (
          <a href={`tel:+${phone}`} className={styles.link}>
            {formatMasked('phone', phone)}
          </a>
        ),
    },
    {
      id: 'email',
      label: 'Email',
      value:
        email === null ? null : (
          <a href={`mailto:${email}`} className={styles.link}>
            {email}
          </a>
        ),
    },
    {
      id: 'district',
      label: 'Район',
      value: textOrNull(labelOf('district', citizen.districtId)),
    },
    {
      id: 'responsible',
      label: 'Ответственный',
      value: textOrNull(labelOf('responsible', citizen.responsibleId)),
    },
  ];
}

function AddressItem({ address }: { address: Address }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemTop}>
        <Text as="span" size="sm" weight="medium">
          {labelOf('addressType', address.type)}
        </Text>
      </div>
      <Text as="span" size="xs" color="secondary">
        {addressText(address)}
      </Text>
    </li>
  );
}
