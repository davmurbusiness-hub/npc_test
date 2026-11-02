import { Tabs } from 'components/Tabs';
import type { TabGroup } from 'components/Tabs';
import { sectionErrorCount } from 'stores/LocalStore/CitizenStore';
import type { SectionKey } from 'types/entities';
import { CITIZEN_SECTIONS, RELATED_SECTIONS, SECTION_LABELS } from 'utils/citizen';

import { useCitizen, useCitizenStore } from '../../context';

export interface SectionNavProps {
  idPrefix: string;
  className?: string;
}

const ALL_SECTIONS: readonly SectionKey[] = [...CITIZEN_SECTIONS, ...RELATED_SECTIONS];

export function SectionNav({ idPrefix, className }: SectionNavProps) {
  const store = useCitizenStore();
  const section = useCitizen((state) => state.section);
  const counts = useCitizen((state) =>
    ALL_SECTIONS.map((key) => sectionErrorCount(state, key)).join(',')
  )
    .split(',')
    .map(Number);
  const badgeOf = (key: SectionKey) => counts[ALL_SECTIONS.indexOf(key)] ?? 0;

  const groups: TabGroup<SectionKey>[] = [
    {
      label: 'Сведения',
      items: CITIZEN_SECTIONS.map((key) => ({
        key,
        label: SECTION_LABELS[key],
        badge: badgeOf(key),
      })),
    },
    {
      label: 'Связанные таблицы',
      items: RELATED_SECTIONS.map((key) => ({
        key,
        label: SECTION_LABELS[key],
        badge: badgeOf(key),
      })),
    },
  ];

  return (
    <Tabs
      label="Разделы карточки"
      groups={groups}
      value={section}
      onChange={(key) => store.selectSection(key)}
      idPrefix={idPrefix}
      orientation="vertical"
      className={className}
    />
  );
}
