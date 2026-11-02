import { registryApi } from 'api';
import { useLocalStore } from 'hooks/useLocalStore';
import { DashboardStore } from 'stores/LocalStore/DashboardStore';
import { rootStore } from 'stores/RootStore';

import { DashboardView } from './components/DashboardView';
import { DashboardStoreContext } from './context';

export function DashboardPage() {
  const store = useLocalStore(() => new DashboardStore({ rootStore, api: registryApi }));

  return (
    <DashboardStoreContext value={store}>
      <DashboardView />
    </DashboardStoreContext>
  );
}
