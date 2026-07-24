import { Handle, Position, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { CanvasNodeKind } from '@auranote/core';

export interface NodeData {
  kind: CanvasNodeKind;
  label?: string;
  text?: string;
  noteId?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}
export type AuraNode = Node<NodeData>;

const DOT = '!size-2 !border-0 !bg-brand-500';
const selectCls =
  'nodrag mt-1 w-full rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 py-1 text-[11px] outline-none';

function useSetLabel(id: string) {
  const { setNodes } = useReactFlow<AuraNode>();
  return (label: string) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
}

function useSetConfig(id: string) {
  const { setNodes } = useReactFlow<AuraNode>();
  return (patch: Record<string, unknown>) =>
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, config: { ...(n.data.config ?? {}), ...patch } } } : n,
      ),
    );
}

function useTags() {
  return useLiveQuery(() => db.tags.filter((t) => !t.deletedAt).toArray(), [], []);
}

function LabelInput({ id, value, placeholder }: { id: string; value?: string; placeholder: string }) {
  const setLabel = useSetLabel(id);
  return (
    <input
      className="nodrag w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--text-soft)]"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => setLabel(e.target.value)}
    />
  );
}

export function CardNode({ id, data, selected }: NodeProps<AuraNode>) {
  const navigate = useNavigate();
  return (
    <div className={`w-44 rounded-lg border bg-[var(--surface)] p-2.5 shadow-sm ${selected ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-[var(--border)]'}`}>
      <Handle type="target" position={Position.Left} className={DOT} />
      {data.noteId ? (
        <div className="mb-0.5 line-clamp-2 text-[13px] font-semibold">{data.label || data.text || 'Note'}</div>
      ) : (
        <LabelInput id={id} value={data.label ?? data.text} placeholder="Carte…" />
      )}
      {data.text && !data.noteId && (
        <div className="mt-0.5 line-clamp-3 text-[11px] text-[var(--text-soft)]">{data.text}</div>
      )}
      {data.noteId && (
        <button onClick={() => navigate(`/note/${data.noteId}`)} className="nodrag mt-1.5 text-[11px] text-brand-600 hover:underline">
          Ouvrir →
        </button>
      )}
      <Handle type="source" position={Position.Right} className={DOT} />
    </div>
  );
}

export function TriggerNode({ id, data, selected }: NodeProps<AuraNode>) {
  const setConfig = useSetConfig(id);
  const tags = useTags();
  const cfg = data.config ?? {};
  const scope = (cfg.scope as string) ?? 'all';
  return (
    <div className={`w-48 rounded-2xl border-2 px-3 py-2 shadow-sm ${selected ? 'ring-2 ring-green-500/30' : ''} border-green-500/60 bg-green-500/10`}>
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">● Déclencheur</div>
      <LabelInput id={id} value={data.label} placeholder="Quand…" />
      <select className={selectCls} value={scope} onChange={(e) => setConfig({ scope: e.target.value })}>
        <option value="all">Toutes les notes</option>
        <option value="tag">Notes avec le tag…</option>
      </select>
      {scope === 'tag' && (
        <select className={selectCls} value={(cfg.tagId as string) ?? ''} onChange={(e) => setConfig({ tagId: e.target.value })}>
          <option value="">— choisir —</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-0 !bg-green-500" />
    </div>
  );
}

export function IfNode({ id, data, selected }: NodeProps<AuraNode>) {
  const setConfig = useSetConfig(id);
  const tags = useTags();
  const cfg = data.config ?? {};
  const field = (cfg.field as string) ?? 'tag';
  return (
    <div className={`w-52 rounded-lg border-2 px-3 py-2 shadow-sm ${selected ? 'ring-2 ring-amber-500/30' : ''} border-amber-500/60 bg-amber-500/10`}>
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-0 !bg-amber-500" />
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">◆ Condition (Si)</div>
      <LabelInput id={id} value={data.label} placeholder="Si…" />
      <select className={selectCls} value={field} onChange={(e) => setConfig({ field: e.target.value })}>
        <option value="tag">a le tag…</option>
        <option value="title">le titre contient…</option>
        <option value="favorite">est un favori</option>
        <option value="pinned">est épinglée</option>
      </select>
      {field === 'tag' && (
        <select className={selectCls} value={(cfg.tagId as string) ?? ''} onChange={(e) => setConfig({ tagId: e.target.value })}>
          <option value="">— tag —</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
      {field === 'title' && (
        <input className={selectCls} placeholder="texte…" value={(cfg.value as string) ?? ''} onChange={(e) => setConfig({ value: e.target.value })} />
      )}
      <div className="mt-1 flex justify-end gap-3 pr-1 text-[9px] font-bold">
        <span className="text-green-600 dark:text-green-400">VRAI</span>
        <span className="text-red-500">FAUX</span>
      </div>
      <Handle id="true" type="source" position={Position.Right} style={{ top: '58%' }} className="!size-2.5 !border-0 !bg-green-500" />
      <Handle id="false" type="source" position={Position.Right} style={{ top: '82%' }} className="!size-2.5 !border-0 !bg-red-500" />
    </div>
  );
}

function useFolders() {
  return useLiveQuery(() => db.folders.filter((f) => !f.deletedAt).toArray(), [], []);
}

export function ActionNode({ id, data, selected }: NodeProps<AuraNode>) {
  const setConfig = useSetConfig(id);
  const tags = useTags();
  const folders = useFolders();
  const cfg = data.config ?? {};
  const type = (cfg.type as string) ?? 'addTag';
  const needsTag = type === 'addTag' || type === 'removeTag';
  const needsFolder = type === 'moveFolder';
  return (
    <div className={`w-48 rounded-lg border-2 px-3 py-2 shadow-sm ${selected ? 'ring-2 ring-blue-500/30' : ''} border-blue-500/60 bg-blue-500/10`}>
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-0 !bg-blue-500" />
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">▶ Action</div>
      <LabelInput id={id} value={data.label} placeholder="Faire…" />
      <select className={selectCls} value={type} onChange={(e) => setConfig({ type: e.target.value })}>
        <option value="addTag">Ajouter un tag</option>
        <option value="removeTag">Retirer un tag</option>
        <option value="pin">Épingler</option>
        <option value="unpin">Désépingler</option>
        <option value="favorite">Mettre en favori</option>
        <option value="unfavorite">Retirer des favoris</option>
        <option value="moveFolder">Déplacer vers un dossier</option>
        <option value="recap">Créer une note récap</option>
      </select>
      {needsTag && (
        <select className={selectCls} value={(cfg.tagId as string) ?? ''} onChange={(e) => setConfig({ tagId: e.target.value })}>
          <option value="">— tag —</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}
      {needsFolder && (
        <select className={selectCls} value={(cfg.folderId as string) ?? ''} onChange={(e) => setConfig({ folderId: e.target.value })}>
          <option value="">— dossier —</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      )}
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-0 !bg-blue-500" />
    </div>
  );
}

export const nodeTypes = {
  card: CardNode,
  trigger: TriggerNode,
  if: IfNode,
  action: ActionNode,
};
