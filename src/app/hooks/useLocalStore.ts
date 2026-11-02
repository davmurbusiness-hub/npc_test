import { useEffect, useState } from 'react';

import type { LocalStore } from 'types/store';

export function useLocalStore<T extends LocalStore>(create: () => T): T {
  const [store] = useState(create);

  useEffect(() => {
    store.init();
    return () => store.destroy();
  }, [store]);

  return store;
}
