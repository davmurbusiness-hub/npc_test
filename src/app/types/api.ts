import type { CitizenId } from './common';
import type { DashboardData, DashboardQuery } from './dashboard';
import type { CitizenCard, CitizenPreview } from './entities';
import type { DuplicateWarning, FieldIssue } from './form';
import type { CitizenPage, CitizenQuery } from './registry';
import type { CardChanges } from './storage';

export type ApiErrorCode = 'notFound' | 'internal';

export interface SaveSuccess {
  ok: true;
  card: CitizenCard;
}

export interface SaveFailure {
  ok: false;
  issues: FieldIssue[];
}

export type SaveResult = SaveSuccess | SaveFailure;

export interface RegistryApi {
  listCitizens(query: CitizenQuery): Promise<CitizenPage>;
  getPreview(id: CitizenId): Promise<CitizenPreview>;
  getCard(id: CitizenId): Promise<CitizenCard>;
  saveCard(id: CitizenId, changes: CardChanges): Promise<SaveResult>;
  findBySnils(snils: string, excludeId?: CitizenId): Promise<DuplicateWarning | null>;
  getDashboard(query: DashboardQuery): Promise<DashboardData>;
  resetDemoData(): Promise<void>;
}
