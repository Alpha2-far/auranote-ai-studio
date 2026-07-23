import { randomUUID } from 'node:crypto';
import { parseRawText } from '@auranote/core';
import { upsertNote, findOrCreateTag } from './syncStore';

export interface IngestInput {
  content: string;
  title?: string;
  tags?: string[];
  source?: string;
}

const TAG_COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ec4899', '#14b8a6', '#ef4444'];
/** Couleur stable dérivée du nom du tag. */
export const colorFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
};

/**
 * Nettoie/structure un texte brut et crée directement une note dans le store de sync
 * (résout les tags en vrais tags colorés). La note est ensuite récupérée par tous les
 * appareils via /sync/pull.
 */
export async function ingestCapture(input: IngestInput): Promise<{ id: string; title: string }> {
  const parsed = parseRawText(input.content, input.title);

  const tagIds: string[] = [];
  for (const name of Array.isArray(input.tags) ? input.tags : []) {
    if (typeof name === 'string' && name.trim()) {
      tagIds.push(await findOrCreateTag(name, colorFor(name.trim())));
    }
  }

  const now = new Date().toISOString();
  const id = randomUUID();
  await upsertNote({
    id,
    title: parsed.title,
    contentMarkdown: parsed.contentMarkdown,
    sections: parsed.sections,
    tagIds,
    pinned: false,
    favorite: false,
    source: input.source ?? 'ingest',
    createdAt: now,
    updatedAt: now,
    syncState: 'synced',
    deletedAt: null,
  });

  return { id, title: parsed.title };
}
