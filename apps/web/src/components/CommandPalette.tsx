import { Command } from 'cmdk';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../store/useUI';
import { db, createNote } from '../db/db';
import { IconPlus, IconZap, IconCanvas, IconMoon, IconSettings, IconNotes } from './icons';

export function CommandPalette() {
  const navigate = useNavigate();
  const { paletteOpen, setPaletteOpen, setSmartPasteOpen, toggleTheme } = useUI();
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().limit(50).toArray(), [], []);

  const go = (fn: () => void) => {
    setPaletteOpen(false);
    fn();
  };

  if (!paletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh]"
      onClick={() => setPaletteOpen(false)}
    >
      <Command
        label="Palette de commandes"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          placeholder="Rechercher une note ou une action…"
          className="w-full border-b border-[var(--border)] bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="p-4 text-center text-sm text-[var(--text-soft)]">
            Aucun résultat.
          </Command.Empty>

          <Command.Group heading="Actions" className="text-xs text-[var(--text-soft)]">
            <Item onSelect={() => go(async () => navigate(`/note/${(await createNote({ title: '' })).id}`))}>
              <IconPlus size={16} /> Nouvelle note
            </Item>
            <Item onSelect={() => go(() => setSmartPasteOpen(true))}>
              <IconZap size={16} /> Smart Paste
            </Item>
            <Item onSelect={() => go(() => navigate('/canvas'))}>
              <IconCanvas size={16} /> Ouvrir le Canvas
            </Item>
            <Item onSelect={() => go(() => toggleTheme())}>
              <IconMoon size={16} /> Basculer le thème
            </Item>
            <Item onSelect={() => go(() => navigate('/settings'))}>
              <IconSettings size={16} /> Réglages
            </Item>
          </Command.Group>

          {notes.length > 0 && (
            <Command.Group heading="Notes" className="mt-2 text-xs text-[var(--text-soft)]">
              {notes.map((n) => (
                <Item key={n.id} onSelect={() => go(() => navigate(`/note/${n.id}`))}>
                  <IconNotes size={16} /> {n.title || 'Sans titre'}
                </Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}

function Item({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text)] aria-selected:bg-brand-500/15"
    >
      {children}
    </Command.Item>
  );
}
