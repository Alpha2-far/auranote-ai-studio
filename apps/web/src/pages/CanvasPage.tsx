import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import { newId, type Canvas, type Note, type CanvasNodeKind } from '@auranote/core';
import { db, saveCanvas, deleteCanvas } from '../db/db';
import { nodeTypes, type NodeData } from '../canvas/nodes';
import { Modal, ConfirmDialog } from '../components/Modal';
import { IconArrowLeft, IconPlus, IconTrash } from '../components/icons';

const edgeStyle = (handle?: string | null) =>
  handle === 'true'
    ? { stroke: '#22c55e' }
    : handle === 'false'
      ? { stroke: '#ef4444' }
      : undefined;

function toFlow(canvas: Canvas): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = canvas.nodes.map((n) => ({
    id: n.id,
    type: n.kind ?? 'card',
    position: { x: n.x, y: n.y },
    data: { kind: n.kind ?? 'card', label: n.label, text: n.text, noteId: n.noteId } as NodeData,
  }));
  const edges: Edge[] = canvas.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    style: edgeStyle(e.sourceHandle),
  }));
  return { nodes, edges };
}

const KINDS: { kind: CanvasNodeKind; label: string }[] = [
  { kind: 'card', label: 'Carte' },
  { kind: 'trigger', label: 'Déclencheur' },
  { kind: 'if', label: 'Condition' },
  { kind: 'action', label: 'Action' },
];

export function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerNotes, setPickerNotes] = useState<Note[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    void db.canvases.get(id).then((c) => {
      if (!c || c.deletedAt) {
        navigate('/canvas', { replace: true });
        return;
      }
      setCanvas(c);
      const flow = toFlow(c);
      setNodes(flow.nodes);
      setEdges(flow.edges);
    });
  }, [id, navigate, setNodes, setEdges]);

  const persist = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      if (!canvas) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveCanvas({
          ...canvas,
          nodes: nextNodes.map((n) => {
            const d = n.data as NodeData;
            return {
              id: n.id,
              kind: d.kind,
              noteId: d.noteId,
              text: d.text,
              label: d.label,
              x: n.position.x,
              y: n.position.y,
              w: 176,
              h: 120,
            };
          }),
          edges: nextEdges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? null,
          })),
        });
      }, 500);
    },
    [canvas],
  );

  useEffect(() => {
    if (canvas) persist(nodes, edges);
  }, [nodes, edges, canvas, persist]);

  const onConnect = useCallback(
    (conn: Connection) =>
      setEdges((eds) =>
        addEdge({ ...conn, id: newId(), style: edgeStyle(conn.sourceHandle) }, eds),
      ),
    [setEdges],
  );

  const spawn = () => ({ x: 120 + (nodes.length % 5) * 60, y: 120 + nodes.length * 40 });

  const addNode = (kind: CanvasNodeKind) => {
    const node: Node = {
      id: newId(),
      type: kind,
      position: spawn(),
      data: { kind, label: '' } as NodeData,
    };
    setNodes((nds) => [...nds, node]);
  };

  const openPicker = async () => {
    const all = await db.notes.orderBy('updatedAt').reverse().filter((n) => !n.deletedAt).limit(50).toArray();
    setPickerNotes(all);
    setPickerOpen(true);
  };

  const addFromNote = (note: Note) => {
    const node: Node = {
      id: newId(),
      type: 'card',
      position: spawn(),
      data: { kind: 'card', label: note.title || 'Sans titre', text: note.contentMarkdown.slice(0, 160), noteId: note.id } as NodeData,
    };
    setNodes((nds) => [...nds, node]);
    setPickerOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        <button onClick={() => navigate('/canvas')} className="shrink-0 text-[var(--text-soft)] hover:text-[var(--text)]" title="Retour">
          <IconArrowLeft size={18} />
        </button>
        <input
          value={canvas?.name ?? ''}
          onChange={(e) => setCanvas((c) => (c ? { ...c, name: e.target.value } : c))}
          onBlur={() => canvas && void saveCanvas(canvas)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k.kind}
              onClick={() => addNode(k.kind)}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/5"
            >
              <IconPlus size={13} /> {k.label}
            </button>
          ))}
          <button onClick={openPicker} className="rounded-lg bg-brand-500 px-2 py-1 text-xs font-semibold text-[#0D0F12] hover:bg-brand-600">
            Depuis une note
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="rounded-lg p-1.5 text-[var(--text-soft)] hover:bg-red-500/10 hover:text-red-500"
            title="Supprimer le canvas"
          >
            <IconTrash size={16} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ maxZoom: 1, padding: 0.3 }}
          minZoom={0.2}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls position="top-left" />
          <MiniMap pannable zoomable className="hidden !bg-[var(--surface)] sm:block" />
        </ReactFlow>
      </div>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Ajouter depuis une note">
        {pickerNotes.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-soft)]">Aucune note disponible.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {pickerNotes.map((n) => (
              <button
                key={n.id}
                onClick={() => addFromNote(n)}
                className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="font-medium">{n.title || 'Sans titre'}</span>
                <span className="line-clamp-1 text-xs text-[var(--text-soft)]">
                  {n.contentMarkdown.replace(/[#>*`_-]/g, '').trim().slice(0, 90) || 'Note vide'}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer le canvas"
        message={`Le canvas « ${canvas?.name ?? ''} » sera supprimé. Continuer ?`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          if (id) void deleteCanvas(id).then(() => navigate('/canvas'));
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
