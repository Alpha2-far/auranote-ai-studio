import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, createNote } from '../db/db';
import { useUI } from '../store/useUI';
import { NoteCard } from '../components/NoteCard';
import { searchNotes } from '../lib/search';
import { importPendingNow } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import type { Note } from '@auranote/core';

export function NotesPage() {
  const navigate = useNavigate();
  const { search, activeTagId, setActiveTag } = useUI();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const sync = async () => {
    setSyncing(true);
    setSyncMsg('');
    const n = await importPendingNow();
    setSyncing(false);
    setSyncMsg(n > 0 ? `${n} note(s) importée(s)` : 'Rien de nouveau');
    setTimeout(() => setSyncMsg(''), 2500);
  };
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [], []);
  const tags = useLiveQuery(() => db.tags.toArray(), [], []);

  const filtered = useMemo(() => {
    let list: Note[] = notes;
    if (activeTagId) list = list.filter((n) => n.tagIds.includes(activeTagId));
    if (search.trim()) list = searchNotes(list, search);
    // Épinglées d'abord
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, activeTagId, search]);

  const newNote = async () => {
    const note = await createNote({ title: '' });
    navigate(`/note/${note.id}`);
  };

  if (notes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="max-w-sm">
          <h2 className="mb-2 text-xl font-bold">Ton second cerveau, vide pour l'instant</h2>
          <p className="text-sm text-[var(--text-soft)]">
            Crée ta première note, ou capture une réponse d'IA avec <b>Smart Paste</b>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newNote}
            className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-[#0D0F12] hover:bg-brand-600"
          >
            + Créer une note
          </button>
          <button
            onClick={sync}
            disabled={syncing}
            className="rounded-lg border border-[var(--border)] px-4 py-2 font-medium hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
          >
            {syncing ? 'Synchro…' : '↻ Synchroniser'}
          </button>
        </div>
        {syncMsg && <span className="text-xs text-[var(--text-soft)]">{syncMsg}</span>}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Notes</h1>
        <div className="flex items-center gap-3">
          {syncMsg && <span className="text-xs text-[var(--text-soft)]">{syncMsg}</span>}
          <button
            onClick={sync}
            disabled={syncing}
            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-sm hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5"
            title="Importer les captures des IA / connecteurs"
          >
            {syncing ? 'Synchro…' : '↻ Synchroniser'}
          </button>
          <span className="text-sm text-[var(--text-soft)]">{filtered.length} note(s)</span>
        </div>
      </div>

      {/* Filtre de tags horizontal (mobile uniquement) */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden [scrollbar-width:none]">
        <button
          onClick={() => setActiveTag(null)}
          className={`shrink-0 rounded-full border px-3 py-1 text-sm ${
            !activeTagId ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
          }`}
        >
          Tous
        </button>
        {tags.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTag(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
              activeTagId === t.id ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
            }`}
          >
            <span className="size-2.5 rounded-full" style={{ background: t.color }} />
            {t.name.split(' ')[0]}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-soft)]">Aucune note ne correspond.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} tags={tags} />
          ))}
        </div>
      )}
    </div>
  );
}
