import { Link } from 'react-router';

import { optionsOf } from 'api/dictionaries';
import type { OriginalHint } from 'stores/LocalStore/CitizenStore';
import type { Citizen } from 'types/entities';
import type { CitizenDraft } from 'types/form';
import { formatIsoDate } from 'utils/format';

import { citizenPath } from 'config/paths';

import { useCitizen } from '../../context';
import { FieldGrid, ViewPair, fieldsOf, useFormScope } from '../fields';
import styles from './sections.module.scss';

const F = fieldsOf<CitizenDraft>();

function hintText(hint: OriginalHint | null): string | undefined {
  switch (hint?.status) {
    case 'checking':
      return 'Проверяем карточку…';
    case 'found':
      return `Найдена: ${hint.fullName}`;
    case 'missing':
      return 'Такой карточки нет в картотеке';
    case undefined:
      return 'Номер карточки-оригинала (id в адресе карточки)';
  }
}

export function ServiceSection({ citizen }: { citizen: Citizen }) {
  const { values, editing } = useFormScope();
  const originalHint = useCitizen((state) => state.originalHint);
  const originalId = typeof values.originalCardId === 'number' ? values.originalCardId : null;

  return (
    <>
      <FieldGrid title="Статус">
        <ViewPair label="Дата смены статуса">{formatIsoDate(citizen.statusChangedAt)}</ViewPair>
        {values.status === 'review' && (
          <F.Select
            name="reviewReason"
            label="Причина проверки"
            options={optionsOf('reviewReason')}
          />
        )}
        {values.status === 'duplicate' &&
          (editing ? (
            <F.Number
              name="originalCardId"
              label="Оригинальная карточка"
              hint={hintText(originalHint)}
              integer
            />
          ) : (
            <ViewPair label="Оригинальная карточка">
              {originalId !== null && (
                <Link to={citizenPath(originalId)} className={styles.link}>
                  Открыть карточку {originalId}
                </Link>
              )}
            </ViewPair>
          ))}
        {values.status === 'archived' && (
          <F.Select
            name="archiveReason"
            label="Причина архивации"
            options={optionsOf('archiveReason')}
          />
        )}
      </FieldGrid>
      <FieldGrid title="Работа с карточкой">
        <F.SearchSelect
          name="responsibleId"
          label="Ответственный сотрудник"
          options={optionsOf('responsible')}
        />
        <F.Select name="source" label="Источник появления" options={optionsOf('cardSource')} />
        <F.MultiSelect name="tags" label="Метки" options={optionsOf('citizenTag')} />
        <F.Date name="lastContactAt" label="Последний контакт" />
        <F.Textarea name="internalNote" label="Внутренняя заметка" />
      </FieldGrid>
    </>
  );
}
