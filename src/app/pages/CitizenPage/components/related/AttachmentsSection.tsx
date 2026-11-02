import { optionsOf } from 'api/dictionaries';
import type { DataTableColumn } from 'components/DataTable';
import type { DraftRow } from 'types/form';
import { objectText } from 'utils/citizen';
import { formatFileSize, formatIsoDateTime } from 'utils/format';
import { labelIn } from 'utils/ui';

import { FieldGrid, ViewPair, fieldsOf, useFormScope } from '../fields';
import styles from './related.module.scss';
import { RelatedSection } from './RelatedSection';
import { useRows } from './useRows';

const T = fieldsOf<DraftRow<'attachments'>>();

function useTargets() {
  const objects = useRows('objects');
  const benefits = useRows('benefits');
  const representatives = useRows('representatives');
  return {
    object: objects.map((row) => ({ value: row.id, label: objectText(row) })),
    benefit: benefits.map((row) => ({
      value: row.id,
      label: [labelIn(optionsOf('benefitKind'), row.kind), row.number].filter(Boolean).join(', '),
    })),
    representative: representatives.map((row) => ({
      value: row.id,
      label: row.fullName ?? row.id,
    })),
  };
}

function AttachmentForm() {
  const { values } = useFormScope();
  const targets = useTargets();
  const target = values.target;
  return (
    <>
      <FieldGrid title="Документ">
        <T.Text name="title" label="Название" />
        <T.Select name="type" label="Тип" options={optionsOf('attachmentType')} />
        <T.Select name="target" label="Относится к" options={optionsOf('attachmentTarget')} />
        {(target === 'object' || target === 'benefit' || target === 'representative') && (
          <T.Select name="targetId" label="Строка карточки" options={targets[target]} />
        )}
        <T.File name="file" label="Файл" accept=".pdf,.jpg,.jpeg,.png" />
        <ViewPair label="Загружено">
          {typeof values.uploadedAt === 'string' ? formatIsoDateTime(values.uploadedAt) : null}
        </ViewPair>
        <T.Textarea name="comment" label="Комментарий" />
      </FieldGrid>
    </>
  );
}

export function AttachmentsSection() {
  const targets = useTargets();
  const columns: DataTableColumn<DraftRow<'attachments'>>[] = [
    { key: 'title', header: 'Название', render: (row) => row.title },
    { key: 'type', header: 'Тип', render: (row) => labelIn(optionsOf('attachmentType'), row.type) },
    {
      key: 'target',
      header: 'Относится к',
      render: (row) => {
        const kind = labelIn(optionsOf('attachmentTarget'), row.target);
        if (row.target === null || row.target === 'card') return kind;
        const label = targets[row.target].find((item) => item.value === row.targetId)?.label;
        return label === undefined ? kind : `${kind}: ${label}`;
      },
    },
    {
      key: 'file',
      header: 'Файл',
      render: (row) =>
        row.file === null ? null : (
          <span className={styles.cell}>
            <span>{row.file.name}</span>
            <span>{formatFileSize(row.file.size)}</span>
          </span>
        ),
    },
    {
      key: 'uploaded',
      header: 'Загружено',
      render: (row) =>
        row.uploadedAt === null ? null : (
          <span className={styles.cell}>
            <span>{formatIsoDateTime(row.uploadedAt)}</span>
            <span>{labelIn(optionsOf('responsible'), row.uploadedBy)}</span>
          </span>
        ),
    },
    { key: 'comment', header: 'Комментарий', render: (row) => row.comment },
  ];

  return (
    <RelatedSection
      table="attachments"
      caption="Вложения"
      columns={columns}
      emptyText="Вложений нет"
      addLabel="Добавить вложение"
      rowLabel={(row) => row.title ?? 'вложение'}
      modalTitle={{ add: 'Новое вложение', edit: 'Вложение' }}
      form={<AttachmentForm />}
    />
  );
}
