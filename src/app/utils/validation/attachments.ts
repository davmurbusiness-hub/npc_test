import type { DraftRow, FieldIssue } from 'types/form';
import { ROW_REQUIRED } from 'utils/card';

import { checkRequired, issueSink, requireWhen } from './rules';

import type { RowContext } from './rules';

export function validateAttachment(row: DraftRow<'attachments'>, _ctx: RowContext): FieldIssue[] {
  const sink = issueSink('attachments', row.id);
  checkRequired(sink, row, ROW_REQUIRED.attachments);
  requireWhen(sink, 'targetId', row.targetId, row.target !== null && row.target !== 'card');
  return sink.list;
}
