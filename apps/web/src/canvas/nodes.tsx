import { Handle, Position, useReactFlow, type Node, type NodeProps } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';
import type { CanvasNodeKind } from '@auranote/core';

export interface NodeData {
  kind: CanvasNodeKind;
  label?: string;
  text?: string;
  noteId?: string;
  [key: string]: unknown;
}
export type AuraNode = Node<NodeData>;

const DOT = '!size-2 !border-0 !bg-brand-500';

/** Met à jour le label d'un nœud (édition inline). */
function useSetLabel(id: string) {
  const { setNodes } = useReactFlow<AuraNode>();
  return (label: string) =>
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n)));
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

/** Carte : texte libre ou référence à une note. */
export function CardNode({ id, data, selected }: NodeProps<AuraNode>) {
  const navigate = useNavigate();
  return (
    <div
      className={`w-44 rounded-lg border bg-[var(--surface)] p-2.5 shadow-sm ${
        selected ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-[var(--border)]'
      }`}
    >
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
        <button
          onClick={() => navigate(`/note/${data.noteId}`)}
          className="nodrag mt-1.5 text-[11px] text-brand-600 hover:underline"
        >
          Ouvrir →
        </button>
      )}
      <Handle type="source" position={Position.Right} className={DOT} />
    </div>
  );
}

/** Déclencheur : point d'entrée d'un flux (une seule sortie). */
export function TriggerNode({ id, data, selected }: NodeProps<AuraNode>) {
  return (
    <div
      className={`w-40 rounded-full border-2 px-3 py-2 shadow-sm ${
        selected ? 'ring-2 ring-green-500/30' : ''
      } border-green-500/60 bg-green-500/10`}
    >
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
        ● Déclencheur
      </div>
      <LabelInput id={id} value={data.label} placeholder="Quand…" />
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-0 !bg-green-500" />
    </div>
  );
}

/** Condition : une entrée, deux sorties (Vrai / Faux). */
export function IfNode({ id, data, selected }: NodeProps<AuraNode>) {
  return (
    <div
      className={`w-48 rounded-lg border-2 px-3 py-2 shadow-sm ${
        selected ? 'ring-2 ring-amber-500/30' : ''
      } border-amber-500/60 bg-amber-500/10`}
    >
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-0 !bg-amber-500" />
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
        ◆ Condition (Si)
      </div>
      <LabelInput id={id} value={data.label} placeholder="Si… alors" />
      <div className="mt-1 flex justify-end gap-3 pr-1 text-[9px] font-bold">
        <span className="text-green-600 dark:text-green-400">VRAI</span>
        <span className="text-red-500">FAUX</span>
      </div>
      <Handle id="true" type="source" position={Position.Right} style={{ top: '42%' }} className="!size-2.5 !border-0 !bg-green-500" />
      <Handle id="false" type="source" position={Position.Right} style={{ top: '78%' }} className="!size-2.5 !border-0 !bg-red-500" />
    </div>
  );
}

/** Action : une étape (une entrée, une sortie). */
export function ActionNode({ id, data, selected }: NodeProps<AuraNode>) {
  return (
    <div
      className={`w-44 rounded-lg border-2 px-3 py-2 shadow-sm ${
        selected ? 'ring-2 ring-blue-500/30' : ''
      } border-blue-500/60 bg-blue-500/10`}
    >
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-0 !bg-blue-500" />
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
        ▶ Action
      </div>
      <LabelInput id={id} value={data.label} placeholder="Faire…" />
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
