import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR ?? join(__dirname, '..', 'data');
const FILE = join(DATA_DIR, 'store.json');

/** Entité synchronisable : tout objet avec id + updatedAt (+ deletedAt optionnel). */
export interface SyncEntity {
  id: string;
  updatedAt: string;
  deletedAt?: string | null;
  [key: string]: unknown;
}

export type Collection = 'notes' | 'tags' | 'canvases' | 'folders';
type Store = Record<Collection, Record<string, SyncEntity>>;

const EMPTY: Store = { notes: {}, tags: {}, canvases: {}, folders: {} };

let cache: Store | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function load(): Promise<Store> {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(await readFile(FILE, 'utf8')) as Partial<Store>;
    cache = {
      notes: parsed.notes ?? {},
      tags: parsed.tags ?? {},
      canvases: parsed.canvases ?? {},
      folders: parsed.folders ?? {},
    };
  } catch {
    cache = structuredClone(EMPTY);
  }
  return cache;
}

/** Écritures sérialisées pour éviter les corruptions concurrentes. */
async function flush(): Promise<void> {
  const snapshot = cache;
  writeChain = writeChain.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(FILE, JSON.stringify(snapshot ?? EMPTY));
  });
  return writeChain;
}

const newer = (a: SyncEntity, b?: SyncEntity) =>
  !b || Date.parse(a.updatedAt) >= Date.parse(b.updatedAt);

/** Fusionne des entités entrantes dans une collection (last-write-wins sur updatedAt). */
export async function mergeEntities(collection: Collection, incoming: SyncEntity[]): Promise<void> {
  if (!incoming?.length) return;
  const store = await load();
  const bucket = store[collection];
  for (const e of incoming) {
    if (!e?.id || !e.updatedAt) continue;
    if (newer(e, bucket[e.id])) bucket[e.id] = e;
  }
  await flush();
}

/** Renvoie les entités modifiées après `since` (tombstones inclus). */
export async function changedSince(since: string | undefined): Promise<Record<Collection, SyncEntity[]>> {
  const store = await load();
  const t = since ? Date.parse(since) : 0;
  const pick = (bucket: Record<string, SyncEntity>) =>
    Object.values(bucket).filter((e) => Date.parse(e.updatedAt) > t);
  return {
    notes: pick(store.notes),
    tags: pick(store.tags),
    canvases: pick(store.canvases),
    folders: pick(store.folders),
  };
}

/** Insère/écrase une entité dans une collection. */
export async function upsertEntity(collection: Collection, entity: SyncEntity): Promise<void> {
  const store = await load();
  store[collection][entity.id] = entity;
  await flush();
}

/** Insère/écrase une note (utilisé par l'ingestion du connecteur). */
export async function upsertNote(note: SyncEntity): Promise<void> {
  await upsertEntity('notes', note);
}

/** Liste les entités non supprimées d'une collection. */
export async function listActive(collection: Collection): Promise<SyncEntity[]> {
  const store = await load();
  return Object.values(store[collection]).filter((e) => !e.deletedAt);
}

/** Récupère une entité par id (ou undefined). */
export async function getEntity(collection: Collection, id: string): Promise<SyncEntity | undefined> {
  const store = await load();
  return store[collection][id];
}

/** Trouve (par nom, insensible à la casse) ou crée un tag ; renvoie son id. */
export async function findOrCreateTag(name: string, color: string): Promise<string> {
  const store = await load();
  const clean = name.trim();
  const existing = Object.values(store.tags).find(
    (t) => !t.deletedAt && String(t.name).toLowerCase() === clean.toLowerCase(),
  );
  if (existing) return existing.id;
  const id = randomUUID();
  store.tags[id] = { id, name: clean, color, updatedAt: new Date().toISOString(), deletedAt: null };
  await flush();
  return id;
}

/** Trouve (par nom) ou crée un dossier ; renvoie son id. */
export async function findOrCreateFolder(name: string): Promise<string> {
  const store = await load();
  const clean = name.trim();
  const existing = Object.values(store.folders).find(
    (f) => !f.deletedAt && String(f.name).toLowerCase() === clean.toLowerCase(),
  );
  if (existing) return existing.id;
  const id = randomUUID();
  store.folders[id] = { id, name: clean, parentId: null, updatedAt: new Date().toISOString(), deletedAt: null };
  await flush();
  return id;
}
