import type { CitizenId } from 'types/common';
import type { CitizenPreview } from 'types/entities';
import type { CitizenPage } from 'types/registry';
import type { RegistryParams } from 'utils/registry';

export type ListState =
  | { status: 'loading'; page: CitizenPage | null }
  | { status: 'ready'; page: CitizenPage }
  | { status: 'error'; page: CitizenPage | null; message: string };

export type PreviewState =
  | { status: 'idle' }
  | { status: 'loading'; id: CitizenId }
  | { status: 'ready'; id: CitizenId; preview: CitizenPreview }
  | { status: 'error'; id: CitizenId; message: string };

export interface RegistryState {
  searchInput: string;
  params: RegistryParams;
  list: ListState;
  preview: PreviewState;
}
