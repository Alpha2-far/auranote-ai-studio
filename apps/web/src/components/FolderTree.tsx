import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, createFolder, deleteFolder } from '../db/db';
import { useUI } from '../store/useUI';
import { cx } from '../lib/config';
import { IconPlus, IconTrash } from './icons';

export function FolderTree() {
  const navigate = useNavigate();
  const folders = useLiveQuery(() => db.folders.filter((f) => !f.deletedAt).toArray(), [], []);
  const { activeFolderId, setActiveFolder, setActiveTag } = useUI();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const select = (id: string | null) => {
    setActiveFolder(id);
    setActiveTag(null);
    navigate('/');
  };

  const add = async () => {
    if (!name.trim()) return;
    const f = await createFolder(name.trim());
    setName('');
    setCreating(false);
    select(f.id);
  };

  const sorted = [...folders].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Dossiers</span>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded p-0.5 text-[var(--text-soft)] hover:bg-black/5 dark:hover:bg-white/5"
          title="Nouveau dossier"
        >
          <IconPlus size={14} />
        </button>
      </div>

      {creating && (
        <div className="mt-1 flex gap-1 px-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void add();
              if (e.key === 'Escape') setCreating(false);
            }}
            placeholder="Nom du dossier…"
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-sm outline-none focus:border-brand-500"
          />
          <button onClick={add} className="rounded-lg bg-brand-500 px-2 text-sm font-semibold text-[#0D0F12]">
            OK
          </button>
        </div>
      )}

      <div className="mt-1 flex flex-col gap-0.5">
        {sorted.map((f) => (
          <div
            key={f.id}
            className={cx(
              'group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              activeFolderId === f.id ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5',
            )}
          >
            <button onClick={() => select(f.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <span className="text-[var(--text-soft)]">🗂</span>
              <span className="truncate">{f.name}</span>
            </button>
            <button
              onClick={() => {
                if (activeFolderId === f.id) setActiveFolder(null);
                void deleteFolder(f.id);
              }}
              className="shrink-0 text-[var(--text-soft)] opacity-0 transition hover:text-red-500 group-hover:opacity-100"
              title="Supprimer le dossier"
            >
              <IconTrash size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
