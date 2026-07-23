import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useRef, useState } from 'react';
import { db, updateNote, deleteNote } from '../db/db';
import { Editor } from '../components/Editor';
import { TagPicker } from '../components/TagPicker';
import { ConfirmDialog } from '../components/Modal';
import { IconArrowLeft, IconPin, IconStar, IconTrash } from '../components/icons';
import { extractTitle } from '@auranote/core';

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const note = useLiveQuery(
    async () => {
      if (!id) return undefined;
      const n = await db.notes.get(id);
      return n && !n.deletedAt ? n : null;
    },
    [id],
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const onContentChange = useCallback(
    (markdown: string) => {
      if (!id) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const note = db.notes.get(id);
        void note.then((n) => {
          if (!n) return;
          const title = n.title?.trim() ? n.title : extractTitle(markdown);
          void updateNote(id, { contentMarkdown: markdown, title });
        });
      }, 400);
    },
    [id],
  );

  if (note === undefined) {
    return <div className="p-6 text-[var(--text-soft)]">Chargement…</div>;
  }
  if (note === null || !note) {
    return (
      <div className="p-6">
        <p className="text-[var(--text-soft)]">Note introuvable.</p>
        <button onClick={() => navigate('/')} className="mt-2 text-brand-600 hover:underline">
          ← Retour
        </button>
      </div>
    );
  }

  const remove = async () => {
    await deleteNote(note.id);
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-3 flex items-center gap-2 text-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--text)]"
        >
          <IconArrowLeft size={16} /> Notes
        </button>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => void updateNote(note.id, { pinned: !note.pinned })}
            className={`rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 ${note.pinned ? 'text-brand-600' : 'text-[var(--text-soft)]'}`}
            title={note.pinned ? 'Désépingler' : 'Épingler'}
          >
            <IconPin size={17} />
          </button>
          <button
            onClick={() => void updateNote(note.id, { favorite: !note.favorite })}
            className={`rounded-lg px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 ${note.favorite ? 'text-amber-500' : 'text-[var(--text-soft)]'}`}
            title="Favori"
          >
            <IconStar size={17} filled={note.favorite} />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg px-2 py-1.5 text-red-500 hover:bg-red-500/10"
            title="Supprimer"
          >
            <IconTrash size={17} />
          </button>
        </div>
      </div>

      <input
        value={note.title}
        onChange={(e) => void updateNote(note.id, { title: e.target.value })}
        placeholder="Titre de la note"
        className="mb-2 w-full bg-transparent text-2xl font-bold outline-none placeholder:text-[var(--text-soft)] md:text-3xl"
      />

      <div className="mb-4">
        <TagPicker selected={note.tagIds} onChange={(tagIds) => void updateNote(note.id, { tagIds })} />
      </div>

      <Editor content={note.contentMarkdown} onChange={onContentChange} />

      {note.source !== 'manual' && (
        <p className="mt-6 text-xs text-[var(--text-soft)]">Source : {note.source}</p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer la note"
        message="Cette note sera définitivement supprimée. Continuer ?"
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          setConfirmOpen(false);
          void remove();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
