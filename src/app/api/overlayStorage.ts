import { DATA_VERSION } from 'data/config';
import type { CitizenId } from 'types/common';
import type { Overlay, OverlayEntry, StorageSnapshot } from 'types/storage';

const STORAGE_KEY = 'ntc:overlay';

const SCHEMA_VERSION = 1;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isSnapshot(value: unknown): value is StorageSnapshot {
  return (
    isRecord(value) &&
    value.schemaVersion === SCHEMA_VERSION &&
    value.dataVersion === DATA_VERSION &&
    isRecord(value.overlay) &&
    isRecord(value.overlay.byCitizen) &&
    Object.values(value.overlay.byCitizen).every(
      (entry) => isRecord(entry) && typeof entry.updatedAt === 'string'
    )
  );
}

const empty = (): Overlay => ({ byCitizen: {} });

export function loadOverlay(): Overlay {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return empty();
    const parsed: unknown = JSON.parse(raw);
    return isSnapshot(parsed) ? parsed.overlay : empty();
  } catch {
    return empty();
  }
}

export function saveOverlayEntry(id: CitizenId, entry: OverlayEntry): void {
  try {
    const overlay = loadOverlay();
    overlay.byCitizen[id] = entry;
    const snapshot: StorageSnapshot = {
      schemaVersion: SCHEMA_VERSION,
      dataVersion: DATA_VERSION,
      overlay,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    return;
  }
}
