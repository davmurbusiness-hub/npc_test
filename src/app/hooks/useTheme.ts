import { useCallback, useEffect } from 'react';
import { useStore } from 'zustand';

import { rootStore } from 'stores/RootStore';
import type { Theme } from 'stores/RootStore';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const stored = useStore(rootStore.theme.state, (state) => state.theme);
  const theme = stored ?? systemTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    rootStore.theme.setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme]);

  return { theme, toggle };
}
