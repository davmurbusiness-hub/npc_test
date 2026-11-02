import { useNavigate } from 'react-router';
import { useStore } from 'zustand';

import { registryApi } from 'api';
import { useLocalStore } from 'hooks/useLocalStore';
import { RegistryStore } from 'stores/LocalStore/RegistryStore';
import { rootStore } from 'stores/RootStore';

import { citizenPath } from 'config/paths';

import { RegistryView } from './components/RegistryView';

export function RegistryPage() {
  const store = useLocalStore(() => new RegistryStore({ rootStore, api: registryApi }));
  const navigate = useNavigate();

  const searchInput = useStore(store.state, (state) => state.searchInput);
  const { filters, sort, selectedId } = useStore(store.state, (state) => state.params);
  const list = useStore(store.state, (state) => state.list);
  const preview = useStore(store.state, (state) => state.preview);
  useStore(rootStore.queryParams.state, (state) => state.search);

  const cardHref = (id: number) => `${citizenPath(id)}${store.listSearchFor(id)}`;

  return (
    <RegistryView
      search={searchInput}
      onSearchChange={(value) => store.setSearchInput(value)}
      filters={filters}
      onFiltersChange={(next) => store.setFilters(next)}
      onFiltersReset={() => store.resetFilters()}
      sort={sort}
      onSortChange={(next) => store.setSort(next)}
      list={list}
      onPageChange={(page) => store.setPage(page)}
      onListRetry={() => store.retryList()}
      selectedId={selectedId}
      onSelect={(id) => store.select(id)}
      onOpen={(id) => void navigate(cardHref(id))}
      preview={preview}
      cardHref={selectedId === null ? null : cardHref(selectedId)}
      onPreviewClose={() => store.closePreview()}
      onPreviewRetry={() => store.retryPreview()}
    />
  );
}
