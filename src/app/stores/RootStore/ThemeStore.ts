import { createJSONStorage, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

export type Theme = 'light' | 'dark';

export const SESSION_STORAGE_KEY = 'ntc:session';

export interface ThemeState {
  theme: Theme | null;
}

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export class ThemeStore {
  readonly state = createStore<ThemeState>()(
    persist((): ThemeState => ({ theme: null }), {
      name: SESSION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const theme =
          typeof persisted === 'object' && persisted !== null && 'theme' in persisted
            ? persisted.theme
            : null;
        return { ...current, theme: isTheme(theme) ? theme : null };
      },
    })
  );

  setTheme(theme: Theme | null): void {
    this.state.setState({ theme });
  }
}
