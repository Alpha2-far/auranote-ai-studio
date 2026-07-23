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

let importing = false;

/**
 * Récupère les captures en attente sur le serveur (extension / partage / connecteur MCP)
 * et les fusionne dans la base locale, puis les acquitte. Local-first : le serveur ne
 * fait que relayer, la source de vérité reste IndexedDB.
 * @returns le nombre de notes importées.
 */
export async function importPendingNow(): Promise<number> {
  if (importing) return 0;
  importing = true;
  try {
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
      /* best-effort : la note est déjà en local */
    }
    return acked.length;
  } finally {
    importing = false;
  }
}

/**
 * Hook : importe les captures au démarrage, à chaque retour sur l'onglet (focus /
 * visibilité) et en filet de sécurité toutes les 20 s. Le trigger sur focus corrige
 * le gel des minuteurs des onglets en arrière-plan.
 */
export function usePendingImport() {
  useEffect(() => {
    void importPendingNow();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void importPendingNow();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const t = setInterval(() => void importPendingNow(), 20_000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearInterval(t);
    };
  }, []);
}

/** Marque une note comme synchronisée localement (placeholder pour futur push). */
export async function markSynced(id: string) {
  await db.notes.update(id, { syncState: 'synced' });
}
