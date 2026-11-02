import { useId } from 'react';

import { labelOf, formatBenefitCategory } from 'api/dictionaries';
import { Avatar } from 'components/Avatar';
import { Badge } from 'components/Badge';
import type { BadgeTone } from 'components/Badge';
import { ButtonLink } from 'components/Button';
import { IconButton } from 'components/IconButton';
import { KeyValueList } from 'components/KeyValueList';
import type { KeyValueItem } from 'components/KeyValueList';
import { NumberText } from 'components/NumberText';
import { StatTile } from 'components/StatTile';
import { Text } from 'components/Text';
import type { BenefitVerification } from 'types/dictionaries';
import type { Benefit, CitizenPreview, PropertyObject } from 'types/entities';
import {
  formatArea,
  formatDiscount,
  formatIsoDate,
  formatYears,
  fullNameOf,
  textOrNull,
} from 'utils/format';
import { formatMasked } from 'utils/masks';
import { STATUS_TONE } from 'utils/ui';

import styles from './CitizenPreview.module.scss';

const VERIFICATION_TONE: Record<BenefitVerification, BadgeTone> = {
  confirmed: 'positive',
  onReview: 'warning',
  expired: 'neutral',
  rejected: 'negative',
};

interface PreviewDetailsProps {
  preview: CitizenPreview;
  cardHref: string | null;
  onClose: () => void;
}

export function PreviewDetails({ preview, cardHref, onClose }: PreviewDetailsProps) {
  const { citizen, benefits, objects } = preview;
  const fullName = fullNameOf(citizen);
  const confirmedCount = benefits.filter((b) => b.verification === 'confirmed').length;
  const baseId = useId();
  const mainId = `${baseId}-main`;
  const benefitsId = `${baseId}-benefits`;
  const objectsId = `${baseId}-objects`;

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

      <div className={styles.tiles}>
        <StatTile label="Задолженность">
          <span className={styles.tileValue}>
            <NumberText
              value={citizen.debt}
              format="money"
              tone={citizen.debt > 0 ? 'negative' : undefined}
            />
          </span>
        </StatTile>
        <StatTile label="Объектов">
          <span className={styles.tileValue}>
            <NumberText value={objects.length} format="count" />
          </span>
        </StatTile>
        <StatTile label="Льгот подтверждено" hint={`из ${benefits.length}`}>
          <span className={styles.tileValue}>
            <NumberText value={confirmedCount} format="count" />
          </span>
        </StatTile>
      </div>

      <section className={styles.section} aria-labelledby={mainId}>
        <Text as="h3" id={mainId} size="md" weight="semibold">
          Основные сведения
        </Text>
        <KeyValueList items={mainItems(citizen)} />
      </section>

      <section className={styles.section} aria-labelledby={benefitsId}>
        <SectionTitle id={benefitsId} title="Льготы" count={benefits.length} />
        {benefits.length === 0 ? (
          <Text size="sm" color="secondary">
            Льгот нет
          </Text>
        ) : (
          <ul className={styles.list}>
            {benefits.map((benefit) => (
              <BenefitItem key={benefit.id} benefit={benefit} />
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-labelledby={objectsId}>
        <SectionTitle id={objectsId} title="Объекты и лицевые счета" count={objects.length} />
        {objects.length === 0 ? (
          <Text size="sm" color="secondary">
            Объектов нет
          </Text>
        ) : (
          <ul className={styles.list}>
            {objects.map((object) => (
              <ObjectItem key={object.id} object={object} />
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
    {
      id: 'benefitCategory',
      label: 'Льготная категория',
      value:
        citizen.benefitCategory === null ? 'Нет' : formatBenefitCategory(citizen.benefitCategory),
    },
  ];
}

function BenefitItem({ benefit }: { benefit: Benefit }) {
  const discount =
    benefit.discountPercent === null ? null : formatDiscount(benefit.discountPercent);
  const until = benefit.validTo === null ? 'бессрочно' : `по ${formatIsoDate(benefit.validTo)}`;

  return (
    <li className={styles.item}>
      <div className={styles.itemTop}>
        <Text as="span" size="sm" weight="medium">
          {labelOf('benefitKind', benefit.kind)}
        </Text>
        {benefit.verification !== null && (
          <Badge tone={VERIFICATION_TONE[benefit.verification]}>
            {labelOf('benefitVerification', benefit.verification)}
          </Badge>
        )}
      </div>
      <Text as="span" size="xs" color="secondary">
        {discount !== null && `Скидка ${discount} · `}
        Действует {until}
      </Text>
    </li>
  );
}

function ObjectItem({ object }: { object: PropertyObject }) {
  const area = formatArea(object.area);

  return (
    <li className={styles.item}>
      <div className={styles.itemTop}>
        <Text as="span" size="sm" weight="medium">
          ЛС {object.accountNumber}
        </Text>
        <Text as="span" size="sm" color="secondary">
          долг{' '}
          <NumberText
            value={object.debt}
            format="money"
            tone={object.debt > 0 ? 'negative' : 'secondary'}
          />
        </Text>
      </div>
      <Text as="span" size="xs" color="secondary">
        {labelOf('objectType', object.type)}
        {area !== null && ` · ${area}`}
      </Text>
    </li>
  );
}
