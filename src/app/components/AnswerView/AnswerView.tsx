import cn from 'classnames';
import { Fragment, useId, useState } from 'react';

import { Accordion } from 'components/Accordion';
import { Alert } from 'components/Alert';
import { NumberText } from 'components/NumberText';
import { OfferCard } from 'components/OfferCard';
import { SourceList } from 'components/SourceList';
import { Text } from 'components/Text';
import type {
  Answer,
  AnswerSection,
  AnswerSectionKind,
  BasisSection,
  Claim,
  ClaimEffect,
  ConfidenceLevel,
  ProductOffer,
  Source,
} from 'types/models';
import { pickOwn } from 'utils/pickOwn';
import { textOrNull } from 'utils/textOrNull';

import { AnswerBlockView } from './AnswerBlockView';
import styles from './AnswerView.module.scss';
import { ClaimItem } from './ClaimItem';

import type { FocusEvent } from 'react';

export interface AnswerViewProps {
  answer: Answer;

  sourcesId?: string;
  className?: string;
}

const SECTION_TITLE = {
  what_happened: 'Что произошло',
  why_it_matters: 'Почему это важно для компании',
  consequences: 'Последствия: риски и возможности',
  bank_view: 'Как оценивает банк',
  actions: 'Какие действия релевантны',
  basis: 'На чём основан вывод',
} satisfies Record<AnswerSectionKind, string>;

const LEVEL = {
  high: 'высокая',
  medium: 'средняя',
  low: 'низкая',
} satisfies Record<ConfidenceLevel, string>;

const EFFECT_TITLE = {
  risk: 'Риски',
  opportunity: 'Возможности',
} satisfies Record<ClaimEffect, string>;

const EFFECT_ORDER: readonly ClaimEffect[] = ['risk', 'opportunity'];

const UNKNOWN_SECTION_TITLE = 'Раздел ответа';

const SUBJECT_LABEL: Partial<Record<string, string>> = {
  group: 'Анализ по группе компаний',
  company_and_group: 'Анализ по компании и её группе компаний',
};
const PROFILE_FIELDS_TITLE = 'Поля профиля';
const THESES_TITLE = 'Тезисы банка';
const SOURCES_TITLE = 'Источники';

interface ClaimListProps {
  claims: readonly Claim[];

  titleAs?: 'h4' | 'h5';
}

function ClaimList({ claims, titleAs }: ClaimListProps) {
  return (
    <ul className={styles.claims} role="list">
      {claims.map((claim, index) => (
        <li key={`${claim.id}:${index}`}>
          <ClaimItem claim={claim} titleAs={titleAs} />
        </li>
      ))}
    </ul>
  );
}

function ConsequenceGroups({ claims }: ClaimListProps) {
  const ungrouped = claims.filter(
    (claim) => !EFFECT_ORDER.some((effect) => effect === claim.effect)
  );

  return (
    <>
      {ungrouped.length > 0 && <ClaimList claims={ungrouped} />}
      {EFFECT_ORDER.map((effect) => {
        const group = claims.filter((claim) => claim.effect === effect);
        if (group.length === 0) return null;

        return (
          <Fragment key={effect}>
            <Text as="h4" size="md" weight="semibold" wrap="normal">
              {EFFECT_TITLE[effect]}
            </Text>
            <ClaimList claims={group} titleAs="h5" />
          </Fragment>
        );
      })}
    </>
  );
}

interface BasisLists {
  profileFields: readonly string[];
  sources: readonly Source[];
  theses: readonly string[];
}

function basisLists(section: BasisSection): BasisLists {
  return {
    profileFields: section.profileFields.filter((text) => textOrNull(text) !== null),
    sources: section.sources,
    theses: section.theses.filter((text) => textOrNull(text) !== null),
  };
}

function isEmptyBasis({ profileFields, sources, theses }: BasisLists): boolean {
  return profileFields.length === 0 && sources.length === 0 && theses.length === 0;
}

interface TextListProps {
  title: string;
  items: readonly string[];

  chips?: boolean;
}

function TextList({ title, items, chips = false }: TextListProps) {
  const titleId = useId();

  return (
    <div className={styles.basisGroup}>
      <Text as="p" id={titleId} size="sm" weight="semibold" wrap="normal">
        {title}
      </Text>
      <ul
        className={chips ? styles.basisChips : styles.basisList}
        role="list"
        aria-labelledby={titleId}
      >
        {items.map((text, index) => (
          <Text
            as="li"
            size="sm"
            wrap="normal"
            className={chips ? styles.basisChip : undefined}
            key={`${index}:${text}`}
          >
            {text}
          </Text>
        ))}
      </ul>
    </div>
  );
}

function BasisBody({ lists }: { lists: BasisLists }) {
  return (
    <>
      {lists.profileFields.length > 0 && (
        <TextList title={PROFILE_FIELDS_TITLE} items={lists.profileFields} chips />
      )}
      {lists.sources.length > 0 && (
        <Accordion title={SOURCES_TITLE} count={lists.sources.length} size="sm" headingLevel={4}>
          <SourceList sources={lists.sources} hideTitle />
        </Accordion>
      )}
      {lists.theses.length > 0 && <TextList title={THESES_TITLE} items={lists.theses} />}
    </>
  );
}

function ClaimsBody({ claims, kind }: { claims: readonly Claim[]; kind: string }) {
  if (kind === 'consequences') return <ConsequenceGroups claims={claims} />;
  return <ClaimList claims={claims} />;
}

interface SectionViewProps {
  section: AnswerSection;

  offer: ProductOffer | null;
}

function SectionView({ section, offer }: SectionViewProps) {
  const titleId = useId();
  const basis = section.kind === 'basis' ? basisLists(section) : null;
  const claims = section.kind === 'basis' ? [] : section.claims;
  const empty = basis === null ? claims.length === 0 : isEmptyBasis(basis);

  if (empty && !offer) return null;

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <Text as="h3" size="lg" weight="semibold" wrap="normal" id={titleId}>
        {pickOwn(SECTION_TITLE, section.kind, UNKNOWN_SECTION_TITLE)}
      </Text>
      {!empty &&
        (basis === null ? (
          <ClaimsBody claims={claims} kind={section.kind} />
        ) : (
          <BasisBody lists={basis} />
        ))}
      {offer && <OfferCard title={offer.productName} description={offer.reason} />}
    </section>
  );
}

interface SourcesBlockProps {
  sources: readonly Source[];
  sourcesId?: string;
}

function SourcesBlock({ sources, sourcesId }: SourcesBlockProps) {
  const [open, setOpen] = useState(false);
  const anchor = sourcesId
    ? {
        id: sourcesId,
        tabIndex: -1,
        className: styles.sourcesAnchor,
        onFocus: (event: FocusEvent<HTMLDivElement>) => {
          if (event.target === event.currentTarget) setOpen(true);
        },
      }
    : {};

  return (
    <div {...anchor}>
      <Accordion
        title={SOURCES_TITLE}
        count={sources.length}
        size="sm"
        open={open}
        onOpenChange={setOpen}
      >
        <SourceList sources={sources} hideTitle />
      </Accordion>
    </div>
  );
}

export function AnswerView({ answer, sourcesId, className }: AnswerViewProps) {
  const { sections, blocks, sources, confidence, limitations, offer, revisedBySelfCheck } = answer;

  if (textOrNull(answer.offTopicReply) !== null) {
    return (
      <div className={cn(styles.root, className)}>
        <Text size="md" wrap="normal">
          {answer.offTopicReply}
        </Text>
      </div>
    );
  }

  const shownLimitations = limitations.filter((text) => textOrNull(text) !== null);

  const level = pickOwn<string | null>(LEVEL, confidence.level, null);
  const hasConfidence = level !== null || confidence.score !== null;

  const subjectLabel = answer.subject
    ? pickOwn<string | null>(SUBJECT_LABEL, answer.subject, null)
    : null;

  const offerIndex = offer ? sections.findIndex((section) => section.kind === 'actions') : -1;

  return (
    <div className={cn(styles.root, className)}>
      {subjectLabel !== null && (
        <Text size="sm" color="secondary" wrap="normal">
          {subjectLabel}
        </Text>
      )}
      {revisedBySelfCheck && (
        <Alert tone="info" title="Самопроверка изменила вывод">
          Агент перепроверил данные и уточнил ответ.
        </Alert>
      )}
      {sections.map((section, index) => (
        <SectionView
          key={`${section.kind}-${index}`}
          section={section}
          offer={index === offerIndex ? offer : null}
        />
      ))}
      {offer && offerIndex === -1 && (
        <OfferCard title={offer.productName} description={offer.reason} />
      )}
      {blocks.map((block, index) => (
        <AnswerBlockView key={`${block.id}:${index}`} block={block} />
      ))}
      {sources.length > 0 && <SourcesBlock sources={sources} sourcesId={sourcesId} />}
      {(hasConfidence || shownLimitations.length > 0) && (
        <div className={styles.meta}>
          {hasConfidence && (
            <Text
              size="sm"
              color={confidence.level === 'low' ? 'warning' : 'secondary'}
              wrap="normal"
            >
              Уверенность{level !== null && `: ${level}`}
              {confidence.score !== null && (
                <>
                  {level === null ? ': ' : ' ('}
                  <NumberText format="percent" value={confidence.score} />
                  {level !== null && ')'}
                </>
              )}
            </Text>
          )}
          {shownLimitations.length > 0 && (
            <Accordion title="Ограничения вывода" size="sm">
              <ul className={styles.limitations} role="list">
                {shownLimitations.map((text, index) => (
                  <Text as="li" size="sm" color="secondary" wrap="normal" key={`${index}:${text}`}>
                    {text}
                  </Text>
                ))}
              </ul>
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
