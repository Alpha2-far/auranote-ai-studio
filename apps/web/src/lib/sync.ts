import { useEffect, useState } from 'react';
import type { Table } from 'dexie';
import type { Note, Tag, Canvas } from '@auranote/core';
import { db } from '../db/db';
import { API_BASE } from './config';
import { setSyncRunner } from './syncBus';

const KEY = 'auranote-sync-key';
const WATERMARK = 'auranote-sync-watermark';

export const getSyncKey = () => localStorage.getItem(KEY) ?? '';
export function setSyncKey(k: string) {
  if (k) localStorage.setItem(KEY, k.trim());
  else localStorage.removeItem(KEY);
}

interface Entity {
  id: string;
  updatedAt?: string;
}

const ts = (e: { updatedAt?: string }) => e.updatedAt ?? '';

export interface SyncResult {
  ok: boolean;
  reason?: 'no-key' | 'busy' | 'offline' | 'unauthorized' | 'push-failed' | 'pull-failed';
  pulled?: number;
  at?: string;
}

let running = false;
let lastResult: SyncResult | null = null;
const listeners = new Set<(r: SyncResult) => void>();
const notify = (r: SyncResult) => {
  lastResult = r;
  listeners.forEach((l) => l(r));
};

async function applyChanges<T extends Entity>(table: Table<T, string>, remote: T[]): Promise<number> {
  if (!remote?.length) return 0;
  let n = 0;
  for (const r of remote) {
    const local = await table.get(r.id);
    // Last-write-wins : on écrase si le distant est plus récent (ou absent en local).
    if (!local || ts(r) >= ts(local)) {
      await table.put(r);
      n++;
    }
  }
  return n;
}

/** Un cycle de synchro : push des changements locaux puis pull LWW du distant. */
export async function syncNow(): Promise<SyncResult> {
  const key = getSyncKey();
  if (!key) return { ok: false, reason: 'no-key' };
  if (running) return { ok: false, reason: 'busy' };
  running = true;
  try {
    const since = localStorage.getItem(WATERMARK) ?? '';
    const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    const changed = <T extends Entity>(arr: T[]) =>
      since ? arr.filter((e) => !e.updatedAt || e.updatedAt > since) : arr;

    const [notes, tags, canvases] = await Promise.all([
      db.notes.toArray(),
      db.tags.toArray(),
      db.canvases.toArray(),
    ]);

    let pushRes: Response;
    try {
      pushRes = await fetch(`${API_BASE}/api/v1/sync/push`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ notes: changed(notes), tags: changed(tags), canvases: changed(canvases) }),
      });
    } catch {
      const r: SyncResult = { ok: false, reason: 'offline' };
      notify(r);
      return r;
    }
    if (pushRes.status === 401) {
      const r: SyncResult = { ok: false, reason: 'unauthorized' };
      notify(r);
      return r;
    }
    if (!pushRes.ok) {
      const r: SyncResult = { ok: false, reason: 'push-failed' };
      notify(r);
      return r;
    }

    const pullRes = await fetch(`${API_BASE}/api/v1/sync/pull?since=${encodeURIComponent(since)}`, {
      headers,
    });
    if (!pullRes.ok) {
      const r: SyncResult = { ok: false, reason: 'pull-failed' };
      notify(r);
      return r;
    }
    const { changes, serverTime } = (await pullRes.json()) as {
      changes: { notes: Note[]; tags: Tag[]; canvases: Canvas[] };
      serverTime: string;
    };

    let pulled = 0;
    pulled += await applyChanges(db.notes, changes.notes ?? []);
    pulled += await applyChanges(db.tags, changes.tags ?? []);
    pulled += await applyChanges(db.canvases, changes.canvases ?? []);

    localStorage.setItem(WATERMARK, serverTime);
    const r: SyncResult = { ok: true, pulled, at: serverTime };
    notify(r);
    return r;
  } finally {
    running = false;
  }
}

/** Réinitialise le curseur de sync (utile après changement de clé → resynchro complète). */
export function resetSyncWatermark() {
  localStorage.removeItem(WATERMARK);
}

/** Hook global : synchro au démarrage, au focus, et toutes les 20 s. */
export function useSync() {
  useEffect(() => {
    setSyncRunner(() => void syncNow());
    void syncNow();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncNow();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    const t = setInterval(() => void syncNow(), 20_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      clearInterval(t);
    };
  }, []);
}

/** Hook d'état de la dernière synchro (pour l'UI). */
export function useSyncStatus(): SyncResult | null {
  const [state, setState] = useState<SyncResult | null>(lastResult);
  useEffect(() => {
    listeners.add(setState);
    return () => void listeners.delete(setState);
  }, []);
  return state;
}
