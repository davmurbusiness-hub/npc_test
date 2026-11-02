import { useState } from 'react';
import { useStore } from 'zustand';

import { Button, ButtonLink } from 'components/Button';
import { ConfirmModal } from 'components/ConfirmModal';
import { Text } from 'components/Text';
import { rootStore } from 'stores/RootStore';
import { buildSearch, parseSearch } from 'utils/registry';

import { PATHS } from 'config/paths';

import styles from './ActionBar.module.scss';
import { useCitizen, useCitizenStore } from '../../context';

function useBackHref(): string {
  const search = useStore(rootStore.queryParams.state, (state) => state.search);
  return `${PATHS.registry}${buildSearch({ ...parseSearch(search), tab: null })}`;
}

export function ActionBar() {
  const store = useCitizenStore();
  const ready = useCitizen((state) => state.load.status === 'ready');
  const mode = useCitizen((state) => state.mode);
  const dirty = useCitizen((state) => state.dirty);
  const saving = useCitizen((state) => state.saving);
  const backHref = useBackHref();
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div className={styles.root}>
      <ButtonLink to={backHref} variant="ghost" icon="arrowLeft">
        К списку
      </ButtonLink>
      {ready && (
        <div className={styles.actions}>
          {mode === 'view' ? (
            <Button variant="primary" icon="edit" onClick={() => store.startEdit()}>
              Редактировать
            </Button>
          ) : (
            <>
              {dirty && (
                <Text as="span" size="sm" color="secondary" className={styles.status}>
                  Есть несохранённые изменения
                </Text>
              )}
              <Button
                disabled={saving}
                onClick={() => (dirty ? setConfirmCancel(true) : store.cancelEdit())}
              >
                Отмена
              </Button>
              <Button variant="primary" icon="check" loading={saving} onClick={() => store.save()}>
                Сохранить
              </Button>
            </>
          )}
        </div>
      )}
      <ConfirmModal
        open={confirmCancel}
        title="Отменить изменения?"
        message="Все правки в карточке, которые ещё не сохранены, пропадут."
        confirmLabel="Отменить правки"
        cancelLabel="Продолжить правку"
        onConfirm={() => {
          setConfirmCancel(false);
          store.cancelEdit();
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
