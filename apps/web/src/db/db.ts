import Dexie, { type Table } from 'dexie';
import { PRESET_TAGS, newId, type Note, type Tag, type Canvas } from '@auranote/core';

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
  }
}

export const db = new AuraNoteDB();

/** Crée les tags pré-définis (les 5 Auras) au premier lancement. */
export async function seedDatabase(): Promise<void> {
  const count = await db.tags.count();
  if (count === 0) {
    await db.tags.bulkAdd(PRESET_TAGS);
  }
}

const now = () => new Date().toISOString();

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
  };
}

export async function createNote(partial: Partial<Note> = {}): Promise<Note> {
  const note = makeNote(partial);
  await db.notes.add(note);
  return note;
}

export async function updateNote(id: string, patch: Partial<Note>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: now() });
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const tag: Tag = { id: newId(), name, color };
  await db.tags.add(tag);
  return tag;
}

export function makeCanvas(name: string): Canvas {
  const ts = now();
  return { id: newId(), name, nodes: [], edges: [], createdAt: ts, updatedAt: ts };
}

export async function saveCanvas(canvas: Canvas): Promise<void> {
  await db.canvases.put({ ...canvas, updatedAt: now() });
}

export async function deleteCanvas(id: string): Promise<void> {
  await db.canvases.delete(id);
}
