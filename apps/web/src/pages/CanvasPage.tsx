import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { newId, type Canvas, type Note } from '@auranote/core';
import { db, saveCanvas, deleteCanvas } from '../db/db';
import { NoteCardNode, type NoteNodeData } from '../canvas/NoteCardNode';
import { Modal, ConfirmDialog } from '../components/Modal';
import { IconArrowLeft, IconPlus, IconTrash } from '../components/icons';

function toFlow(canvas: Canvas): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = canvas.nodes.map((n) => ({
    id: n.id,
    type: 'noteCard',
    position: { x: n.x, y: n.y },
    data: { title: n.text?.split('\n')[0] ?? 'Carte', text: n.text, noteId: n.noteId } as NoteNodeData,
  }));
  const edges: Edge[] = canvas.edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
  return { nodes, edges };
}

export function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nodeTypes = useMemo(() => ({ noteCard: NoteCardNode }), []);

  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const [addCardOpen, setAddCardOpen] = useState(false);
  const [cardText, setCardText] = useState('');
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
      const { nodes, edges } = toFlow(c);
      setNodes(nodes);
      setEdges(edges);
    });
  }, [id, navigate, setNodes, setEdges]);

  // Persistance debouncée vers Dexie
  const persist = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      if (!canvas) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveCanvas({
          ...canvas,
          nodes: nextNodes.map((n) => ({
            id: n.id,
            noteId: (n.data as NoteNodeData).noteId,
            text: (n.data as NoteNodeData).text,
            x: n.position.x,
            y: n.position.y,
            w: 224,
            h: 120,
          })),
          edges: nextEdges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
        });
      }, 500);
    },
    [canvas],
  );

  useEffect(() => {
    if (canvas) persist(nodes, edges);
  }, [nodes, edges, canvas, persist]);

  const onConnect = useCallback(
    (conn: Connection) => setEdges((eds) => addEdge({ ...conn, id: newId() }, eds)),
    [setEdges],
  );

  const spawnPosition = () => ({
    x: 120 + (nodes.length % 5) * 40,
    y: 120 + nodes.length * 30,
  });

  const confirmAddCard = () => {
    const text = cardText.trim();
    if (!text) return;
    const node: Node = {
      id: newId(),
      type: 'noteCard',
      position: spawnPosition(),
      data: { title: text.split('\n')[0], text } as NoteNodeData,
    };
    setNodes((nds) => [...nds, node]);
    setCardText('');
    setAddCardOpen(false);
  };

  const openPicker = async () => {
    const all = await db.notes.orderBy('updatedAt').reverse().filter((n) => !n.deletedAt).limit(50).toArray();
    setPickerNotes(all);
    setPickerOpen(true);
  };

  const addFromNote = (note: Note) => {
    const node: Node = {
      id: newId(),
      type: 'noteCard',
      position: spawnPosition(),
      data: {
        title: note.title || 'Sans titre',
        text: note.contentMarkdown.slice(0, 160),
        noteId: note.id,
      } as NoteNodeData,
    };
    setNodes((nds) => [...nds, node]);
    setPickerOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        <button
          onClick={() => navigate('/canvas')}
          className="shrink-0 text-[var(--text-soft)] hover:text-[var(--text)]"
          title="Retour aux canvas"
        >
          <IconArrowLeft size={18} />
        </button>
        <input
          value={canvas?.name ?? ''}
          onChange={(e) => setCanvas((c) => (c ? { ...c, name: e.target.value } : c))}
          onBlur={() => canvas && void saveCanvas(canvas)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setAddCardOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            <IconPlus size={15} />
            <span className="hidden sm:inline">Carte</span>
          </button>
          <button
            onClick={openPicker}
            className="flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600"
          >
            <IconPlus size={15} />
            <span className="sm:hidden">Note</span>
            <span className="hidden sm:inline">Depuis une note</span>
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

      <Modal open={addCardOpen} onClose={() => setAddCardOpen(false)} title="Nouvelle carte">
        <textarea
          value={cardText}
          onChange={(e) => setCardText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') confirmAddCard();
          }}
          autoFocus
          placeholder="Contenu de la carte…"
          className="h-32 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm outline-none focus:border-brand-500"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setAddCardOpen(false)}
            className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            onClick={confirmAddCard}
            disabled={!cardText.trim()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600 disabled:opacity-40"
          >
            Ajouter
          </button>
        </div>
      </Modal>

      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Ajouter depuis une note">
        {pickerNotes.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-soft)]">
            Aucune note disponible. Crée d'abord une note.
          </p>
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
        message={`Le canvas « ${canvas?.name ?? ''} » sera définitivement supprimé. Continuer ?`}
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
