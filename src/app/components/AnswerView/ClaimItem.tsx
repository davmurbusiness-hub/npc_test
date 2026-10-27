import cn from 'classnames';

import { Badge } from 'components/Badge';
import { OriginLabel } from 'components/OriginLabel';
import { RichText } from 'components/RichText';
import { SourceLink } from 'components/SourceList';
import { Text } from 'components/Text';
import type { Claim } from 'types/models';
import { pickOwn } from 'utils/pickOwn';

import styles from './ClaimItem.module.scss';

export interface ClaimItemProps {
  claim: Claim;

  titleAs?: 'h4' | 'h5';
}

const STRIPE_CLASS: Partial<Record<string, string>> = {
  fact: styles.fact,
  bank_view: styles.bankView,
  ai_conclusion: styles.aiConclusion,
};

const UNSOURCED_LABEL = 'без источника';
const OFFER_LABEL = 'Предложение Альфа-Банка';

const SCOPE_LABEL: Partial<Record<string, string>> = {
  company: 'О компании',
  group: 'О группе',
};
const SOURCES_LABEL = 'Источники утверждения';

export function ClaimItem({ claim, titleAs = 'h4' }: ClaimItemProps) {
  const { kind, text, sources, unsourced } = claim;
  const title = claim.title?.trim() || null;
  const productName = claim.productName?.trim() || null;
  const scope = claim.scope ? pickOwn<string | null>(SCOPE_LABEL, claim.scope, null) : null;

  return (
    <div className={cn(styles.root, pickOwn(STRIPE_CLASS, kind, styles.aiConclusion))}>
      <div className={styles.meta}>
        <OriginLabel kind={kind} />
        {unsourced && <Badge tone="warning">{UNSOURCED_LABEL}</Badge>}
        {scope !== null && <Badge tone="info">{scope}</Badge>}

        {productName !== null && <Badge tone="positive">{`${OFFER_LABEL}: ${productName}`}</Badge>}
      </div>
      {title !== null && (
        <Text as={titleAs} size="md" weight="semibold" wrap="normal">
          {title}
        </Text>
      )}

      {kind === 'ai_conclusion' ? (
        <RichText text={text} />
      ) : (
        <Text size="md" wrap="normal">
          {text}
        </Text>
      )}
      {sources.length > 0 && (
        <ul className={styles.sources} role="list" aria-label={SOURCES_LABEL}>
          {sources.map((source, index) => (
            <li key={`${source.id}:${index}`}>
              <SourceLink source={source} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
