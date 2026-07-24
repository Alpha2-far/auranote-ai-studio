import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db, makeCanvas, saveCanvas, deleteCanvas } from '../db/db';
import { IconCanvas, IconPlus, IconTrash } from '../components/icons';
import { ConfirmDialog } from '../components/Modal';

export function CanvasListPage() {
  const navigate = useNavigate();
  const canvases = useLiveQuery(
    () => db.canvases.orderBy('updatedAt').reverse().filter((c) => !c.deletedAt).toArray(),
    [],
    [],
  );
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const create = async () => {
    const canvas = makeCanvas('Nouveau canvas');
    await saveCanvas(canvas);
    navigate(`/canvas/${canvas.id}`);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Canvas</h1>
        <button
          onClick={create}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600"
        >
          <IconPlus size={16} /> Nouveau canvas
        </button>
      </div>
      {canvases.length === 0 ? (
        <p className="text-sm text-[var(--text-soft)]">
          Aucun canvas. Crée un tableau infini pour organiser tes notes en cartes reliées.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {canvases.map((c) => (
            <div
              key={c.id}
              className="group relative flex h-32 flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-brand-300 hover:shadow-lg"
            >
              <button
                onClick={() => setToDelete({ id: c.id, name: c.name })}
                className="absolute right-2 top-2 rounded-lg p-1.5 text-[var(--text-soft)] opacity-100 transition hover:bg-red-500/10 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100"
                title="Supprimer le canvas"
              >
                <IconTrash size={15} />
              </button>
              <button onClick={() => navigate(`/canvas/${c.id}`)} className="flex flex-1 flex-col justify-between text-left">
                <IconCanvas size={22} className="text-brand-600" />
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-[var(--text-soft)]">{c.nodes.length} carte(s)</div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer le canvas"
        message={`Le canvas « ${toDelete?.name ?? ''} » sera définitivement supprimé. Continuer ?`}
        confirmLabel="Supprimer"
        danger
        onConfirm={() => {
          if (toDelete) void deleteCanvas(toDelete.id);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
