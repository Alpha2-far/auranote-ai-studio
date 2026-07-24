import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { Logo } from './Logo';
import { FolderTree } from './FolderTree';
import { db, createNote } from '../db/db';
import { useUI } from '../store/useUI';
import { cx } from '../lib/config';
import {
  IconNotes,
  IconCanvas,
  IconSettings,
  IconZap,
  IconSearch,
  IconSun,
  IconMoon,
  IconMenu,
  IconPanelLeftClose,
  IconPlus,
} from './icons';

function TagDot({ color }: { color: string }) {
  return <span className="size-2.5 rounded-full" style={{ background: color }} />;
}

export function Layout() {
  const navigate = useNavigate();
  const tags = useLiveQuery(() => db.tags.filter((t) => !t.deletedAt).toArray(), [], []);
  const {
    activeTagId,
    setActiveTag,
    setActiveFolder,
    toggleTheme,
    theme,
    setPaletteOpen,
    setSmartPasteOpen,
    sidebarOpen,
    toggleSidebar,
  } = useUI();

  const selectTag = (id: string | null) => {
    setActiveTag(id);
    setActiveFolder(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setSmartPasteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen, setSmartPasteOpen]);

  const newNote = async () => {
    const note = await createNote({ title: '' });
    navigate(`/note/${note.id}`);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-500/12 text-brand-700 dark:text-brand-300'
        : 'text-[var(--text-soft)] hover:bg-black/5 dark:hover:bg-white/5',
    );

  return (
    <div className="flex h-full">
      <aside
        className={cx(
          'hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-3',
          sidebarOpen ? 'md:flex' : 'md:hidden',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2 px-2 pt-1">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <span className="text-lg font-bold tracking-tight">AuraNote</span>
          </div>
          <button
            onClick={toggleSidebar}
            title="Fermer le menu"
            className="rounded-lg p-1.5 text-[var(--text-soft)] transition hover:bg-black/5 dark:hover:bg-white/5"
          >
            <IconPanelLeftClose size={18} />
          </button>
        </div>

        <button
          onClick={newNote}
          className="mb-2 flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-[#0D0F12] transition hover:bg-brand-600"
        >
          <IconPlus size={16} /> Nouvelle note
        </button>
        <button
          onClick={() => setSmartPasteOpen(true)}
          className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          <IconZap size={15} /> Smart Paste
        </button>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            <IconNotes size={18} /> Notes
          </NavLink>
          <NavLink to="/canvas" className={linkClass}>
            <IconCanvas size={18} /> Canvas
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <IconSettings size={18} /> Réglages
          </NavLink>
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <FolderTree />

          <div className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
            Tags
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              onClick={() => selectTag(null)}
              className={cx(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                !activeTagId ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5',
              )}
            >
              Tous
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => selectTag(tag.id)}
                className={cx(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors',
                  activeTagId === tag.id ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5',
                )}
              >
                <TagDot color={tag.color} />
                <span className="truncate">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-soft)] transition hover:bg-black/5 dark:hover:bg-white/5"
        >
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar onNewNote={newNote} />
        <div className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>
      </main>

      <MobileNav onNewNote={newNote} />
    </div>
  );
}

function TopBar({ onNewNote }: { onNewNote: () => void }) {
  const { search, setSearch, setPaletteOpen, sidebarOpen, toggleSidebar } = useUI();
  return (
    <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-2.5 backdrop-blur">
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          title="Ouvrir le menu"
          className="hidden rounded-lg p-1.5 text-[var(--text-soft)] hover:bg-black/5 md:inline-flex dark:hover:bg-white/5"
        >
          <IconMenu size={18} />
        </button>
      )}
      <div className="flex items-center gap-2 md:hidden">
        <Logo size={26} />
        <span className="font-bold">AuraNote</span>
      </div>
      <div className="relative flex-1">
        <IconSearch
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setPaletteOpen(true)}
          placeholder="Rechercher…  (⌘K)"
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <button
        onClick={onNewNote}
        className="rounded-lg bg-brand-500 p-2 text-[#0D0F12] transition hover:bg-brand-600 md:hidden"
        aria-label="Nouvelle note"
      >
        <IconPlus size={18} />
      </button>
    </header>
  );
}

function MobileNav({ onNewNote }: { onNewNote: () => void }) {
  const { setSmartPasteOpen } = useUI();
  const item = ({ isActive }: { isActive: boolean }) =>
    cx(
      'flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px]',
      isActive ? 'text-brand-600 dark:text-brand-300' : 'text-[var(--text-soft)]',
    );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-[var(--border)] bg-[var(--surface)]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <NavLink to="/" end className={item}>
        <IconNotes size={20} />
        Notes
      </NavLink>
      <NavLink to="/canvas" className={item}>
        <IconCanvas size={20} />
        Canvas
      </NavLink>
      <button
        onClick={onNewNote}
        className="mx-1 -mt-4 flex size-12 items-center justify-center rounded-full bg-brand-500 text-[#0D0F12] shadow-lg"
        aria-label="Nouvelle note"
      >
        <IconPlus size={24} />
      </button>
      <button
        onClick={() => setSmartPasteOpen(true)}
        className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] text-[var(--text-soft)]"
      >
        <IconZap size={18} />
        Paste
      </button>
      <NavLink to="/settings" className={item}>
        <IconSettings size={20} />
        Réglages
      </NavLink>
    </nav>
  );
}
