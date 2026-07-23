import { useNavigate } from 'react-router-dom';
import type { Note, Tag } from '@auranote/core';
import { updateNote } from '../db/db';
import { IconPin, IconStar } from './icons';

function excerpt(note: Note): string {
  const md = note.contentMarkdown.replace(/[#>*`_-]/g, '').replace(/\s+/g, ' ').trim();
  return md.slice(0, 180) || 'Note vide';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function NoteCard({ note, tags }: { note: Note; tags: Tag[] }) {
  const navigate = useNavigate();
  const noteTags = tags.filter((t) => note.tagIds.includes(t.id));

  return (
    <button
      onClick={() => navigate(`/note/${note.id}`)}
      className="group flex h-52 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:hover:border-brand-500/40"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-semibold leading-snug">{note.title || 'Sans titre'}</h3>
        <div className="flex shrink-0 gap-1.5 text-[var(--text-soft)]">
          {note.pinned && <IconPin size={14} className="text-brand-600" />}
          {note.favorite && <IconStar size={14} filled className="text-amber-500" />}
        </div>
      </div>
      <p className="line-clamp-4 flex-1 text-sm text-[var(--text-soft)]">{excerpt(note)}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {noteTags.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: `${t.color}22`, color: t.color }}
            >
              {t.name.split(' ')[0]}
            </span>
          ))}
        </div>
        <time className="shrink-0 text-[11px] text-[var(--text-soft)]">
          {formatDate(note.updatedAt)}
        </time>
      </div>
      <div
        className="mt-2 flex gap-3 text-xs text-[var(--text-soft)] opacity-0 transition group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          role="button"
          onClick={() => void updateNote(note.id, { pinned: !note.pinned })}
          className="hover:text-[var(--text)]"
        >
          {note.pinned ? 'Désépingler' : 'Épingler'}
        </span>
        <span
          role="button"
          onClick={() => void updateNote(note.id, { favorite: !note.favorite })}
          className="hover:text-[var(--text)]"
        >
          {note.favorite ? 'Retirer favori' : 'Favori'}
        </span>
      </div>
    </button>
  );
}
