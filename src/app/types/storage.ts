import type { CitizenId, IsoDateTime, RowId } from './common';
import type { CitizenEditable, PropertyObject, RelatedRowMap, RelatedTableKey } from './entities';

export interface RowChanges<T> {
  upserted: T[];
  deletedIds: RowId[];
}

export type EditableTableKey = Exclude<RelatedTableKey, 'payments' | 'notifications'>;

export type EditableRowMap = Omit<RelatedRowMap, 'payments' | 'notifications' | 'objects'> & {
  objects: Omit<PropertyObject, 'debt'>;
};

export interface CardChanges {
  citizen?: Partial<CitizenEditable>;
  related?: { [K in EditableTableKey]?: RowChanges<EditableRowMap[K]> };
}

export interface OverlayEntry extends CardChanges {
  updatedAt: IsoDateTime;
}

export interface Overlay {
  byCitizen: Record<CitizenId, OverlayEntry>;
}

export interface StorageSnapshot {
  schemaVersion: number;
  dataVersion: number;
  overlay: Overlay;
}
