import { useState } from 'react';

import { Badge } from 'components/Badge';
import { Button } from 'components/Button';
import { ConfirmModal } from 'components/ConfirmModal';
import { DataTable } from 'components/DataTable';
import type { DataTableColumn } from 'components/DataTable';
import { EmptyState } from 'components/EmptyState';
import { Icon } from 'components/Icon';
import { IconButton } from 'components/IconButton';
import { Modal } from 'components/Modal';
import { Text } from 'components/Text';
import { rowEditorIssue, rowsWithErrors, tableIssue } from 'stores/LocalStore/CitizenStore';
import type { DraftRow } from 'types/form';
import type { EditableTableKey } from 'types/storage';

import { useCitizen, useCitizenStore } from '../../context';
import { FormScopeContext } from '../fields';
import styles from './related.module.scss';
import { useRows } from './useRows';

import type { FormScopeValue } from '../fields';
import type { ReactNode } from 'react';

export interface RelatedSectionProps<K extends EditableTableKey> {
  table: K;
  caption: string;
  columns: readonly DataTableColumn<DraftRow<K>>[];
  emptyText: string;
  addLabel: string;
  rowLabel: (row: DraftRow<K>) => string;
  modalTitle: { add: string; edit: string };
  form: ReactNode;
}

export function RelatedSection<K extends EditableTableKey>({
  table,
  caption,
  columns,
  emptyText,
  addLabel,
  rowLabel,
  modalTitle,
  form,
}: RelatedSectionProps<K>) {
  const store = useCitizenStore();
  const editing = useCitizen((state) => state.mode === 'edit');
  const rows = useRows(table);
  const invalid = useCitizen((state) => rowsWithErrors(state, table)).split('|');
  const issue = useCitizen((state) => tableIssue(state, table));
  const editor = useCitizen((state) => (state.rowEditor?.table === table ? state.rowEditor : null));
  const [deleting, setDeleting] = useState<DraftRow<K> | null>(null);

  const actions: DataTableColumn<DraftRow<K>> = {
    key: 'actions',
    header: 'Действия',
    align: 'end',
    render: (row) => (
      <span className={styles.actions}>
        {invalid.includes(row.id) && <Badge tone="negative">Ошибка</Badge>}
        <IconButton
          icon="edit"
          size="sm"
          label={`Изменить: ${rowLabel(row)}`}
          onClick={() => store.openRowEditor(table, row.id)}
        />
        <IconButton
          icon="trash"
          size="sm"
          label={`Удалить: ${rowLabel(row)}`}
          onClick={() => setDeleting(row)}
        />
      </span>
    ),
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Text as="span" size="sm" color="secondary">
          Записей: {rows.length}
        </Text>
        {editing && (
          <Button icon="plus" size="sm" onClick={() => store.openRowEditor(table, null)}>
            {addLabel}
          </Button>
        )}
      </div>
      {issue !== undefined && (
        <div role="alert" className={styles.issue}>
          <Icon name="alert" size="sm" color="negative" />
          <Text as="span" size="sm">
            {issue.message}
          </Text>
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyState title={emptyText} />
      ) : (
        <DataTable
          caption={caption}
          captionVisibility="hidden"
          columns={editing ? [...columns, actions] : columns}
          rows={rows}
          getRowKey={(row) => row.id}
        />
      )}

      <Modal
        open={editor !== null}
        onClose={() => store.closeRowEditor()}
        title={editor?.isNew === false ? modalTitle.edit : modalTitle.add}
        size="lg"
        footer={
          <>
            <Button onClick={() => store.closeRowEditor()}>Отмена</Button>
            <Button variant="primary" icon="check" onClick={() => store.applyRow()}>
              Применить
            </Button>
          </>
        }
      >
        <RowFormScope>{form}</RowFormScope>
      </Modal>

      <ConfirmModal
        open={deleting !== null}
        title="Удалить строку?"
        message={
          deleting === null ? '' : `«${rowLabel(deleting)}» уйдёт из карточки при сохранении.`
        }
        confirmLabel="Удалить"
        onConfirm={() => {
          if (deleting !== null) store.deleteRow(table, deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function RowFormScope({ children }: { children: ReactNode }) {
  const store = useCitizenStore();
  const editor = useCitizen((state) => state.rowEditor);
  if (editor === null) return null;

  const scope: FormScopeValue = {
    values: { ...editor.row },
    editing: true,
    disabled: false,
    table: editor.table,
    rowId: editor.row.id,
    set: (field, value) => store.setRowField(editor.table, field as never, value as never),
    touch: (field) => store.touchRowField(field),
    issue: (state, field) => rowEditorIssue(state, field),
  };
  return (
    <FormScopeContext value={scope}>
      <div className={styles.form}>{children}</div>
    </FormScopeContext>
  );
}
