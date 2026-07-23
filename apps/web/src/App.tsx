import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Layout } from './components/Layout';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShareTargetHandler } from './pages/ShareTargetHandler';
import { CommandPalette } from './components/CommandPalette';
import { SmartPasteDialog } from './components/SmartPasteDialog';
import { useSync } from './lib/sync';

// Chargement différé : l'éditeur (TipTap) et le canvas (React Flow) sont lourds.
const NoteEditorPage = lazy(() =>
  import('./pages/NoteEditorPage').then((m) => ({ default: m.NoteEditorPage })),
);
const CanvasListPage = lazy(() =>
  import('./pages/CanvasListPage').then((m) => ({ default: m.CanvasListPage })),
);
const CanvasPage = lazy(() => import('./pages/CanvasPage').then((m) => ({ default: m.CanvasPage })));

const Loading = () => <div className="p-6 text-[var(--text-soft)]">Chargement…</div>;

export function App() {
  useSync();
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/share-target" element={<ShareTargetHandler />} />
          <Route element={<Layout />}>
            <Route path="/" element={<NotesPage />} />
            <Route path="/note/:id" element={<NoteEditorPage />} />
            <Route path="/canvas" element={<CanvasListPage />} />
            <Route path="/canvas/:id" element={<CanvasPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <CommandPalette />
      <SmartPasteDialog />
    </>
  );
}
