import { newId, parseRawText } from '@auranote/core';
import { addCapture } from './store';

export interface IngestInput {
  content: string;
  title?: string;
  tags?: string[];
  source?: string;
}

/** Nettoie/structure un texte brut et l'ajoute aux captures en attente. */
export async function ingestCapture(input: IngestInput): Promise<{ id: string; title: string }> {
  const parsed = parseRawText(input.content, input.title);
  const capture = {
    id: newId(),
    title: parsed.title,
    content: input.content,
    tags: Array.isArray(input.tags) ? input.tags : undefined,
    source: input.source ?? 'ingest',
    createdAt: new Date().toISOString(),
  };
  await addCapture(capture);
  return { id: capture.id, title: parsed.title };
}
