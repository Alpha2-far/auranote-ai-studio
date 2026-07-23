import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseRawText } from '@auranote/core';
import { createNote } from '../db/db';

/**
 * Cible de partage Web (PWA mobile) : /share-target?title=&text=&url=
 * Crée une note à partir du contenu partagé puis redirige vers l'éditeur.
 */
export function ShareTargetHandler() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const text = params.get('text') ?? '';
    const title = params.get('title') ?? '';
    const url = params.get('url') ?? '';
    const raw = [text, url].filter(Boolean).join('\n\n');

    if (!raw.trim()) {
      navigate('/', { replace: true });
      return;
    }
    const parsed = parseRawText(raw, title);
    void createNote({
      title: parsed.title,
      contentMarkdown: parsed.contentMarkdown,
      sections: parsed.sections,
      source: 'ShareTarget',
    }).then((note) => navigate(`/note/${note.id}`, { replace: true }));
  }, [params, navigate]);

  return <div className="p-8 text-center text-[var(--text-soft)]">Import du partage…</div>;
}
