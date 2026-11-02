import type { RelatedBase } from 'types/entities';
import type { DraftRow } from 'types/form';
import type { EditableTableKey } from 'types/storage';
import { HOME_REGION } from 'utils/citizen';

export const ROW_TEMPLATES: {
  [K in EditableTableKey]: (base: RelatedBase) => DraftRow<K>;
} = {
  addresses: (base) => ({
    ...base,
    type: null,
    isPrimary: false,
    region: HOME_REGION,
    district: null,
    city: null,
    street: null,
    house: null,
    building: null,
    apartment: null,
    postalCode: null,
    validFrom: null,
    validTo: null,
  }),
  contracts: (base) => ({
    ...base,
    contractNumber: null,
    concludedAt: null,
    validUntil: null,
    status: 'active',
    conclusionMethod: null,
    terminatedAt: null,
    terminationReason: null,
  }),
  familyMembers: (base) => ({
    ...base,
    fullName: null,
    relation: null,
    birthDate: null,
    gender: null,
    residence: 'permanent',
    registeredFrom: null,
    category: null,
    documentNumber: null,
    snils: null,
    studyOrWorkPlace: null,
    isDependent: false,
  }),
};
