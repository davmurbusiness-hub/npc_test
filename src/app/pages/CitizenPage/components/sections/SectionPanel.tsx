import { tabId, tabPanelId } from 'components/Tabs';
import { Text } from 'components/Text';
import type { Citizen, SectionKey } from 'types/entities';
import { SECTION_LABELS } from 'utils/citizen';

import { useCitizen } from '../../context';
import {
  AddressesSection,
  AttachmentsSection,
  BenefitsSection,
  ContractsSection,
  EducationSection,
  EmploymentSection,
  FamilySection,
  NotificationsSection,
  ObjectsSection,
  PaymentsSection,
  RepresentativesSection,
} from '../related';
import { CitizenFormScope } from './CitizenFormScope';
import { ComputedSection } from './ComputedSection';
import { ConsentsSection } from './ConsentsSection';
import { ContactsSection } from './ContactsSection';
import { DigitalSection } from './DigitalSection';
import { DocumentsSection } from './DocumentsSection';
import { MainSection } from './MainSection';
import styles from './sections.module.scss';
import { ServiceSection } from './ServiceSection';
import { SocialSection } from './SocialSection';

export interface SectionPanelProps {
  idPrefix: string;
  citizen: Citizen;
}

function renderSection(section: SectionKey, citizen: Citizen) {
  switch (section) {
    case 'main':
      return <MainSection citizen={citizen} />;
    case 'contacts':
      return <ContactsSection />;
    case 'documents':
      return <DocumentsSection />;
    case 'social':
      return <SocialSection citizen={citizen} />;
    case 'digital':
      return <DigitalSection />;
    case 'consents':
      return <ConsentsSection />;
    case 'service':
      return <ServiceSection citizen={citizen} />;
    case 'computed':
      return <ComputedSection citizen={citizen} />;
    case 'addresses':
      return <AddressesSection />;
    case 'objects':
      return <ObjectsSection />;
    case 'contracts':
      return <ContractsSection />;
    case 'familyMembers':
      return <FamilySection />;
    case 'education':
      return <EducationSection />;
    case 'employment':
      return <EmploymentSection />;
    case 'benefits':
      return <BenefitsSection />;
    case 'representatives':
      return <RepresentativesSection />;
    case 'payments':
      return <PaymentsSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'attachments':
      return <AttachmentsSection />;
  }
}

export function SectionPanel({ idPrefix, citizen }: SectionPanelProps) {
  const section = useCitizen((state) => state.section);

  return (
    <div
      role="tabpanel"
      id={tabPanelId(idPrefix)}
      aria-labelledby={tabId(idPrefix, section)}
      tabIndex={0}
      className={styles.panel}
    >
      <Text as="h2" size="lg" weight="semibold">
        {SECTION_LABELS[section]}
      </Text>
      <CitizenFormScope>{renderSection(section, citizen)}</CitizenFormScope>
    </div>
  );
}
