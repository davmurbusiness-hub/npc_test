import type { CitizenId, IsoDateTime } from 'types/common';
import type { CardDraft, FieldIssue } from 'types/form';
import type { CardChanges } from 'types/storage';
import { EDITABLE_TABLES } from 'utils/card';
import { isoToDays, toTimestamp } from 'utils/isoDate';

const SECONDS_IN_DAY = 86_400;

function secondsOf(stamp: IsoDateTime): number {
  return (
    Number(stamp.slice(11, 13)) * 3600 +
    Number(stamp.slice(14, 16)) * 60 +
    Number(stamp.slice(17, 19))
  );
}

export function demoNow(todayIso: string): IsoDateTime {
  const clock = new Date();
  return toTimestamp(
    isoToDays(todayIso),
    clock.getHours() * 3600 + clock.getMinutes() * 60 + clock.getSeconds()
  );
}

export function nextUpdatedAt(todayIso: string, latest: IsoDateTime): IsoDateTime {
  const now = demoNow(todayIso);
  if (latest === '' || now > latest) return now;
  const days = isoToDays(latest.slice(0, 10));
  const second = secondsOf(latest) + 1;
  return second >= SECONDS_IN_DAY
    ? toTimestamp(days + 1, second - SECONDS_IN_DAY)
    : toTimestamp(days, second);
}

export function sanitizeChanges(id: CitizenId, changes: CardChanges): CardChanges {
  const { statusChangedAt: _ignored, ...citizen } = changes.citizen ?? {};
  const related: NonNullable<CardChanges['related']> = {};
  for (const table of EDITABLE_TABLES) {
    const rows = changes.related?.[table];
    if (rows === undefined) continue;
    Object.assign(related, {
      [table]: {
        upserted: rows.upserted
          .filter((row) => row.id.startsWith(`${id}-`))
          .map((row) => ({ ...row, citizenId: id })),
        deletedIds: rows.deletedIds,
      },
    });
  }
  return { citizen, related };
}

export function originalCardIssues(
  draft: CardDraft,
  id: CitizenId,
  citizensCount: number
): FieldIssue[] {
  const originalId = draft.citizen.originalCardId;
  if (originalId === null || originalId === id) return [];
  if (Number.isInteger(originalId) && originalId >= 1 && originalId <= citizensCount) return [];
  return [
    {
      table: 'citizens',
      rowId: null,
      field: 'originalCardId',
      severity: 'error',
      code: 'referenced',
      message: `Карточки ${originalId} нет в картотеке`,
    },
  ];
}
