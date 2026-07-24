import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  paletteOpen: boolean;
  smartPasteOpen: boolean;
  search: string;
  activeTagId: string | null;
  activeFolderId: string | null;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setPaletteOpen: (v: boolean) => void;
  setSmartPasteOpen: (v: boolean) => void;
  setSearch: (v: string) => void;
  setActiveTag: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
}

function initialTheme(): Theme {
  const stored = localStorage.getItem('auranote-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('auranote-theme', theme);
}

export const useUI = create<UIState>((set, get) => ({
  theme: 'light',
  sidebarOpen: localStorage.getItem('auranote-sidebar') !== 'closed',
  paletteOpen: false,
  smartPasteOpen: false,
  search: '',
  activeTagId: null,
  activeFolderId: null,
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  toggleSidebar: () =>
    set((s) => {
      const sidebarOpen = !s.sidebarOpen;
      localStorage.setItem('auranote-sidebar', sidebarOpen ? 'open' : 'closed');
      return { sidebarOpen };
    }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setSmartPasteOpen: (smartPasteOpen) => set({ smartPasteOpen }),
  setSearch: (search) => set({ search }),
  setActiveTag: (activeTagId) => set({ activeTagId }),
  setActiveFolder: (activeFolderId) => set({ activeFolderId }),
}));

/** À appeler une fois au démarrage pour appliquer le thème initial. */
export function bootstrapTheme() {
  const theme = initialTheme();
  useUI.getState().setTheme(theme);
}
