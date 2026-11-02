import { useId } from 'react';

import { registryApi } from 'api';
import { StatusAnnouncer } from 'components/StatusAnnouncer';
import { ToastStack } from 'components/ToastStack';
import { useLocalStore } from 'hooks/useLocalStore';
import { CitizenStore } from 'stores/LocalStore/CitizenStore';
import { rootStore } from 'stores/RootStore';

import { citizenPath } from 'config/paths';

import styles from './CitizenPage.module.scss';
import { ActionBar } from './components/ActionBar';
import { CardError, CardNotFound, CardSkeleton } from './components/CardStates';
import { CitizenHeader } from './components/CitizenHeader';
import { LeaveGuard } from './components/LeaveGuard';
import { SectionNav } from './components/SectionNav';
import { SectionPanel } from './components/sections';
import { CitizenStoreContext, useCitizen, useCitizenStore } from './context';

export function CitizenPageContent({ id }: { id: string }) {
  const store = useLocalStore(
    () => new CitizenStore({ rootStore, api: registryApi, id, pathname: citizenPath(id) })
  );
  return (
    <CitizenStoreContext value={store}>
      <CardLayout />
    </CitizenStoreContext>
  );
}

function CardLayout() {
  const store = useCitizenStore();
  const load = useCitizen((state) => state.load);
  const citizen = useCitizen((state) => state.card?.citizen ?? null);
  const saving = useCitizen((state) => state.saving);
  const toasts = useCitizen((state) => state.toasts);
  const announcement = useCitizen((state) => state.announcement);
  const idPrefix = useId();

  return (
    <div className={styles.page} aria-busy={load.status === 'loading' || saving || undefined}>
      <ActionBar />
      {load.status === 'loading' && <CardSkeleton />}
      {load.status === 'notFound' && <CardNotFound />}
      {load.status === 'error' && (
        <CardError message={load.message} onRetry={() => store.retry()} />
      )}
      {load.status === 'ready' && citizen !== null && (
        <>
          <CitizenHeader citizen={citizen} />
          <div className={styles.layout}>
            <SectionNav idPrefix={idPrefix} className={styles.nav} />
            <SectionPanel idPrefix={idPrefix} citizen={citizen} />
          </div>
        </>
      )}
      <LeaveGuard />
      <StatusAnnouncer message={announcement} />
      <ToastStack toasts={toasts} onDismiss={(toastId) => store.dismissToast(toastId)} />
    </div>
  );
}
