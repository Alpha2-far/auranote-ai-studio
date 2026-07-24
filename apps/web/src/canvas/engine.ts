import type { CanvasNode, CanvasEdge, Note } from '@auranote/core';
import { db, updateNote, createNote } from '../db/db';

export interface RunResult {
  processed: number;
  actions: number;
  log: string[];
}

const cfg = (n: CanvasNode) => n.config ?? {};

function scopeNotes(trigger: CanvasNode, all: Note[]): Note[] {
  const c = cfg(trigger);
  if (c.scope === 'tag' && c.tagId) return all.filter((n) => n.tagIds.includes(c.tagId as string));
  return all;
}

function evalCondition(node: CanvasNode, note: Note): boolean {
  const c = cfg(node);
  switch (c.field) {
    case 'tag':
      return c.tagId ? note.tagIds.includes(c.tagId as string) : false;
    case 'title':
      return String(note.title ?? '').toLowerCase().includes(String(c.value ?? '').toLowerCase());
    case 'favorite':
      return Boolean(note.favorite);
    case 'pinned':
      return Boolean(note.pinned);
    default:
      return false;
  }
}

async function applyAction(node: CanvasNode, notes: Note[], log: string[]): Promise<number> {
  const c = cfg(node);
  const type = c.type as string;
  const tagId = c.tagId as string | undefined;
  let count = 0;

  if (type === 'recap') {
    await createNote({
      title: `Récap — ${node.label || 'Workflow'}`,
      contentMarkdown: notes.length
        ? notes.map((n) => `- ${n.title || 'Sans titre'}`).join('\n')
        : '_Aucune note._',
      source: 'workflow',
    });
    log.push(`Note récap créée (${notes.length} note(s))`);
    return 1;
  }

  const folderId = c.folderId as string | undefined;

  for (const n of notes) {
    if (type === 'addTag' && tagId) {
      if (!n.tagIds.includes(tagId)) await updateNote(n.id, { tagIds: [...n.tagIds, tagId] });
    } else if (type === 'removeTag' && tagId) {
      if (n.tagIds.includes(tagId)) await updateNote(n.id, { tagIds: n.tagIds.filter((t) => t !== tagId) });
    } else if (type === 'moveFolder') {
      await updateNote(n.id, { folderId: folderId || null });
    } else if (type === 'pin') {
      await updateNote(n.id, { pinned: true });
    } else if (type === 'unpin') {
      await updateNote(n.id, { pinned: false });
    } else if (type === 'favorite') {
      await updateNote(n.id, { favorite: true });
    } else if (type === 'unfavorite') {
      await updateNote(n.id, { favorite: false });
    } else {
      continue;
    }
    count++;
  }
  if (count) log.push(`${node.label || type} → ${count} note(s)`);
  return count;
}

/** Exécute un canvas : part des déclencheurs, évalue les conditions, applique les actions. */
export async function runCanvas(nodes: CanvasNode[], edges: CanvasEdge[]): Promise<RunResult> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const outFrom = (id: string) => edges.filter((e) => e.source === id);
  const all = await db.notes.filter((n) => !n.deletedAt).toArray();
  const result: RunResult = { processed: 0, actions: 0, log: [] };

  const triggers = nodes.filter((n) => (n.kind ?? 'card') === 'trigger');
  if (!triggers.length) {
    result.log.push('Aucun déclencheur dans ce canvas.');
    return result;
  }

  const traverse = async (nodeId: string, notes: Note[], visited: Set<string>): Promise<void> => {
    if (visited.has(nodeId) || notes.length === 0) return;
    const node = byId.get(nodeId);
    if (!node) return;
    const kind = node.kind ?? 'card';
    const outs = outFrom(nodeId);

    if (kind === 'action') {
      result.actions += await applyAction(node, notes, result.log);
    }

    if (kind === 'if') {
      const pass: Note[] = [];
      const fail: Note[] = [];
      for (const n of notes) (evalCondition(node, n) ? pass : fail).push(n);
      for (const e of outs) {
        const forward = e.sourceHandle === 'true' ? pass : e.sourceHandle === 'false' ? fail : notes;
        await traverse(e.target, forward, new Set([...visited, nodeId]));
      }
      return;
    }

    for (const e of outs) await traverse(e.target, notes, new Set([...visited, nodeId]));
  };

  for (const trig of triggers) {
    const set = scopeNotes(trig, all);
    result.processed += set.length;
    await traverse(trig.id, set, new Set());
  }

  return result;
}
