/**
 * @auranote/core — Types partagés (web, serveur, extension)
 */

export type CalloutStyle =
  | 'intuition'
  | 'clarification'
  | 'insight'
  | 'perspective'
  | 'warning';

export type BlockType = 'text' | 'bullet' | 'callout';

export interface Block {
  type: BlockType;
  content: string;
  /** Présent uniquement pour type === 'callout' */
  style?: CalloutStyle;
  label?: string;
}

export interface Section {
  id: string;
  /** 0 = introduction / bloc sans numéro */
  number: number;
  title: string;
  blocks: Block[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  updatedAt?: string;
  /** Soft-delete pour la synchronisation (tombstone). */
  deletedAt?: string | null;
}

export type SyncState = 'local' | 'pending' | 'synced';

export interface Note {
  id: string;
  title: string;
  contentMarkdown: string;
  sections: Section[];
  tagIds: string[];
  pinned: boolean;
  favorite: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  syncState: SyncState;
  /** Soft-delete pour la synchronisation (tombstone). */
  deletedAt?: string | null;
}

export type CanvasNodeKind = 'card' | 'trigger' | 'if' | 'action';

export interface CanvasNode {
  id: string;
  kind?: CanvasNodeKind;
  noteId?: string;
  text?: string;
  label?: string;
  /** Paramètres d'exécution (trigger: scope/tagId ; if: field/op/value ; action: type/tagId). */
  config?: Record<string, unknown>;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  /** Pour les nœuds « if » : 'true' | 'false'. */
  sourceHandle?: string | null;
}

export interface Canvas {
  id: string;
  name: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: string;
  updatedAt: string;
  /** Soft-delete pour la synchronisation (tombstone). */
  deletedAt?: string | null;
}

/** Résultat de l'analyse d'un texte collé/ingéré */
export interface ParsedNote {
  title: string;
  sections: Section[];
  contentMarkdown: string;
}

/** Les 5 "Auras" d'origine, désormais des tags pré-créés. */
export const PRESET_TAGS: Tag[] = [
  { id: 'tag-strategy', name: 'Stratégie & Décisions', color: '#8B5CF6' },
  { id: 'tag-actions', name: 'Actions & Objectifs', color: '#3B82F6' },
  { id: 'tag-tech', name: 'Technique & Architecture', color: '#22C55E' },
  { id: 'tag-workflows', name: 'Workflows & Processus', color: '#EAB308' },
  { id: 'tag-inspirations', name: 'Inspirations & Idées brutes', color: '#F97316' },
];
