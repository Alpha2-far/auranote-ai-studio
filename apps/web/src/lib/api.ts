import { useEffect } from 'react';
import { parseRawText, type Note } from '@auranote/core';
import { API_BASE } from './config';
import { db, createNote } from '../db/db';

interface PendingCapture {
  id: string;
  content: string;
  title?: string;
  tags?: string[];
  source?: string;
}

/**
 * Récupère les captures en attente sur le serveur (extension / partage) et les
 * fusionne dans la base locale, puis les acquitte. Local-first : le serveur ne
 * fait que relayer, la source de vérité reste IndexedDB.
 */
async function importPending(): Promise<number> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/notes/pending`);
  } catch {
    return 0; // serveur indisponible → mode 100% local
  }
  if (!res.ok) return 0;

  const { captures } = (await res.json()) as { captures: PendingCapture[] };
  if (!captures?.length) return 0;

  const acked: string[] = [];
  for (const cap of captures) {
    const parsed = parseRawText(cap.content, cap.title);
    const note: Partial<Note> = {
      title: parsed.title,
      contentMarkdown: parsed.contentMarkdown,
      sections: parsed.sections,
      source: cap.source ?? 'ingest',
      syncState: 'synced',
    };
    await createNote(note);
    acked.push(cap.id);
  }

  try {
    await fetch(`${API_BASE}/api/v1/notes/ack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: acked }),
    });
  } catch {
    /* best-effort */
  }
  return acked.length;
}

/** Hook : importe les captures au démarrage puis toutes les 30 s. */
export function usePendingImport() {
  useEffect(() => {
    void importPending();
    const t = setInterval(() => void importPending(), 30_000);
    return () => clearInterval(t);
  }, []);
}

/** Marque une note comme synchronisée localement (placeholder pour futur push). */
export async function markSynced(id: string) {
  await db.notes.update(id, { syncState: 'synced' });
}
