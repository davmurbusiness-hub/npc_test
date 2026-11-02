import { useEffect } from 'react';
import { useBlocker } from 'react-router';

import { ConfirmModal } from 'components/ConfirmModal';
import { hasUnsavedWork } from 'stores/LocalStore/CitizenStore';

import { useCitizen } from '../../context';

export function LeaveGuard() {
  const unsaved = useCitizen(hasUnsavedWork);
  const saving = useCitizen((state) => state.saving);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      unsaved && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (!unsaved) return undefined;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsaved]);

  return (
    <ConfirmModal
      open={blocker.state === 'blocked'}
      title={saving ? 'Карточка сохраняется' : 'Уйти без сохранения?'}
      message={
        saving
          ? 'Сохранение ещё идёт. Если уйти сейчас, результат вы не увидите.'
          : 'В карточке есть несохранённые правки. Если уйти, они пропадут.'
      }
      confirmLabel="Уйти"
      cancelLabel="Остаться"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  );
}
