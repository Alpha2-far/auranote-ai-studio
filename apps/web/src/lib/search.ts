import MiniSearch from 'minisearch';
import type { Note } from '@auranote/core';

/** Recherche plein texte simple sur titre + contenu. */
export function searchNotes(notes: Note[], query: string): Note[] {
  const q = query.trim();
  if (!q) return notes;

  const mini = new MiniSearch<Note>({
    fields: ['title', 'contentMarkdown'],
    storeFields: ['id'],
    searchOptions: { boost: { title: 2 }, prefix: true, fuzzy: 0.2 },
  });
  mini.addAll(notes);

  const byId = new Map(notes.map((n) => [n.id, n]));
  return mini
    .search(q)
    .map((r) => byId.get(r.id as string))
    .filter((n): n is Note => Boolean(n));
}
