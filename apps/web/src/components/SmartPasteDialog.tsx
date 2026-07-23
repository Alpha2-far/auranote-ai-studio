import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseRawText } from '@auranote/core';
import { useUI } from '../store/useUI';
import { createNote } from '../db/db';
import { IconZap, IconX } from './icons';

export function SmartPasteDialog() {
  const { smartPasteOpen, setSmartPasteOpen } = useUI();
  const [text, setText] = useState('');
  const navigate = useNavigate();

  if (!smartPasteOpen) return null;

  const close = () => {
    setText('');
    setSmartPasteOpen(false);
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch {
      /* accès presse-papier refusé — saisie manuelle */
    }
  };

  const save = async () => {
    if (!text.trim()) return;
    const parsed = parseRawText(text);
    const note = await createNote({
      title: parsed.title,
      contentMarkdown: parsed.contentMarkdown,
      sections: parsed.sections,
      source: 'SmartPaste',
    });
    close();
    navigate(`/note/${note.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <IconZap size={18} className="text-brand-500" /> Smart Paste
          </h2>
          <button onClick={close} className="text-[var(--text-soft)] hover:text-[var(--text)]">
            <IconX size={18} />
          </button>
        </div>
        <p className="mb-2 text-sm text-[var(--text-soft)]">
          Colle une réponse d'IA : le texte est nettoyé (scories UI retirées), un titre est extrait et
          les sections sont détectées automatiquement.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          placeholder="Colle ici le texte de Gemini, Claude ou ChatGPT…"
          className="h-64 w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 text-sm outline-none focus:border-brand-500"
        />
        <div className="mt-3 flex justify-between">
          <button
            onClick={pasteFromClipboard}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
          >
            Coller depuis le presse-papier
          </button>
          <div className="flex gap-2">
            <button onClick={close} className="rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
              Annuler
            </button>
            <button
              onClick={save}
              disabled={!text.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600 disabled:opacity-40"
            >
              Créer la note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
