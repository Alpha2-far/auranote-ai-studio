import Dexie, { type Table } from 'dexie';
import { PRESET_TAGS, newId, type Note, type Tag, type Canvas } from '@auranote/core';
import { scheduleSync } from '../lib/syncBus';

export interface Setting {
  key: string;
  value: unknown;
}

class AuraNoteDB extends Dexie {
  notes!: Table<Note, string>;
  tags!: Table<Tag, string>;
  canvases!: Table<Canvas, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('AuraNoteDB');
    this.version(2).stores({
      notes: 'id, title, createdAt, updatedAt, pinned, favorite, syncState, *tagIds',
      tags: 'id, name',
      canvases: 'id, name, updatedAt',
      settings: 'key',
    });
    // v3 : soft-delete (deletedAt) pour la synchronisation multi-appareils.
    this.version(3)
      .stores({
        notes: 'id, title, createdAt, updatedAt, pinned, favorite, syncState, deletedAt, *tagIds',
        tags: 'id, name, updatedAt, deletedAt',
        canvases: 'id, name, updatedAt, deletedAt',
        settings: 'key',
      })
      .upgrade(async (tx) => {
        const stamp = new Date().toISOString();
        await tx.table('notes').toCollection().modify((n) => { n.deletedAt = null; });
        await tx.table('tags').toCollection().modify((t) => { t.deletedAt = null; t.updatedAt ??= stamp; });
        await tx.table('canvases').toCollection().modify((c) => { c.deletedAt = null; });
      });
  }
}

export const db = new AuraNoteDB();

const now = () => new Date().toISOString();

/** Crée les tags pré-définis (les 5 Auras) au premier lancement. */
export async function seedDatabase(): Promise<void> {
  const count = await db.tags.count();
  if (count === 0) {
    const stamp = now();
    await db.tags.bulkAdd(PRESET_TAGS.map((t) => ({ ...t, updatedAt: stamp, deletedAt: null })));
  }
}

// --- Requêtes actives (filtrent les tombstones deletedAt) ---
export const activeNotes = () => db.notes.filter((n) => !n.deletedAt).toArray();
export const activeTags = () => db.tags.filter((t) => !t.deletedAt).toArray();
export const activeCanvases = () => db.canvases.filter((c) => !c.deletedAt).toArray();

export function makeNote(partial: Partial<Note> = {}): Note {
  const ts = now();
  return {
    id: partial.id ?? newId(),
    title: partial.title ?? 'Sans titre',
    contentMarkdown: partial.contentMarkdown ?? '',
    sections: partial.sections ?? [],
    tagIds: partial.tagIds ?? [],
    pinned: partial.pinned ?? false,
    favorite: partial.favorite ?? false,
    source: partial.source ?? 'manual',
    createdAt: partial.createdAt ?? ts,
    updatedAt: partial.updatedAt ?? ts,
    syncState: partial.syncState ?? 'local',
    deletedAt: partial.deletedAt ?? null,
  };
}

export async function createNote(partial: Partial<Note> = {}): Promise<Note> {
  const note = makeNote(partial);
  await db.notes.add(note);
  scheduleSync();
  return note;
}

export async function updateNote(id: string, patch: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: now() });
  scheduleSync();
}

/** Soft-delete : conserve un tombstone pour propager la suppression aux autres appareils. */
export async function deleteNote(id: string): Promise<void> {
  await db.notes.update(id, { deletedAt: now(), updatedAt: now() });
  scheduleSync();
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const tag: Tag = { id: newId(), name, color, updatedAt: now(), deletedAt: null };
  await db.tags.add(tag);
  scheduleSync();
  return tag;
}

export function makeCanvas(name: string): Canvas {
  const ts = now();
  return { id: newId(), name, nodes: [], edges: [], createdAt: ts, updatedAt: ts, deletedAt: null };
}

export async function saveCanvas(canvas: Canvas): Promise<void> {
  await db.canvases.put({ ...canvas, updatedAt: now() });
  scheduleSync();
}

export async function deleteCanvas(id: string): Promise<void> {
  await db.canvases.update(id, { deletedAt: now(), updatedAt: now() });
  scheduleSync();
}
