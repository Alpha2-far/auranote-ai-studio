import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useNavigate } from 'react-router-dom';

export interface NoteNodeData {
  title: string;
  text?: string;
  noteId?: string;
  [key: string]: unknown;
}

export function NoteCardNode({ data, selected }: NodeProps & { data: NoteNodeData }) {
  const navigate = useNavigate();
  return (
    <div
      className={`w-44 rounded-lg border bg-[var(--surface)] p-2.5 shadow-sm transition ${
        selected ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-[var(--border)]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!size-1.5 !bg-brand-500" />
      <div className="mb-0.5 line-clamp-2 text-[13px] font-semibold leading-snug">
        {data.title || 'Carte'}
      </div>
      {data.text && (
        <div className="line-clamp-3 text-[11px] leading-snug text-[var(--text-soft)]">
          {data.text}
        </div>
      )}
      {data.noteId && (
        <button
          onClick={() => navigate(`/note/${data.noteId}`)}
          className="mt-1.5 text-[11px] text-brand-600 hover:underline"
        >
          Ouvrir →
        </button>
      )}
      <Handle type="source" position={Position.Right} className="!size-1.5 !bg-brand-500" />
    </div>
  );
}
