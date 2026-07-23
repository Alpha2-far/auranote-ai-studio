import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useUI } from '../store/useUI';
import { IconSun, IconMoon } from '../components/icons';

const apiOrigin = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
    >
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  );
}

export function SettingsPage() {
  const { theme, setTheme } = useUI();
  const noteCount = useLiveQuery(() => db.notes.count(), [], 0);
  const tagCount = useLiveQuery(() => db.tags.count(), [], 0);
  const [authRequired, setAuthRequired] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${apiOrigin}/api/config`)
      .then((r) => r.json())
      .then((c) => setAuthRequired(Boolean(c.authRequired)))
      .catch(() => setAuthRequired(null));
  }, []);

  const mcpUrl = `${apiOrigin}/mcp`;
  const desktopConfig = JSON.stringify(
    {
      mcpServers: {
        auranote: {
          command: 'npx',
          args: ['-y', 'mcp-remote', mcpUrl],
        },
      },
    },
    null,
    2,
  );

  const exportAll = async () => {
    const notes = await db.notes.toArray();
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'auranote-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold">Réglages</h1>

      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-3 font-semibold">Apparence</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
              theme === 'light' ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
            }`}
          >
            <IconSun size={16} /> Clair
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
              theme === 'dark' ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
            }`}
          >
            <IconMoon size={16} /> Sombre
          </button>
        </div>
      </section>

      {/* Connecteur MCP — brancher Claude à AuraNote (comme Firecrawl) */}
      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-1 font-semibold">Connecteur (MCP)</h2>
        <p className="mb-3 text-sm text-[var(--text-soft)]">
          Branche Claude à ton carnet : depuis Claude, tu peux dire « enregistre ça dans mon carnet »
          et la note arrive ici via l'outil <code>save_note</code>.
        </p>

        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">
          URL du connecteur
        </label>
        <div className="mb-3 flex items-center gap-2">
          <input
            readOnly
            value={mcpUrl}
            className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 font-mono text-sm outline-none"
          />
          <CopyButton text={mcpUrl} />
        </div>

        <div className="mb-3 rounded-lg bg-black/5 p-3 text-sm dark:bg-white/5">
          <div className="mb-1 font-semibold">Token d'accès</div>
          {authRequired === null ? (
            <p className="text-[var(--text-soft)]">Serveur injoignable — impossible de vérifier l'authentification.</p>
          ) : authRequired ? (
            <p className="text-[var(--text-soft)]">
              🔒 Authentification <b>activée</b>. Le token est la variable <code>API_SECRET</code> que tu as
              définie sur Railway (Variables). Fournis-le au connecteur via l'en-tête{' '}
              <code>Authorization: Bearer &lt;API_SECRET&gt;</code>. Pour ta sécurité, il n'est jamais affiché ici.
            </p>
          ) : (
            <p className="text-[var(--text-soft)]">
              ⚠️ Aucune authentification. N'importe qui connaissant l'URL peut écrire. Sur Railway, définis une
              variable <code>API_SECRET</code> pour exiger un token.
            </p>
          )}
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">Configuration Claude Desktop</summary>
          <p className="mt-2 text-[var(--text-soft)]">
            Ajoute ceci dans <code>claude_desktop_config.json</code> (Réglages → Développeur), puis redémarre
            Claude :
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-3 text-xs dark:bg-white/5">{desktopConfig}</pre>
          <div className="mt-2">
            <CopyButton text={desktopConfig} />
          </div>
          <p className="mt-2 text-[var(--text-soft)]">
            Pour <b>claude.ai</b> (connecteur distant) : Réglages → Connecteurs → « Ajouter un connecteur
            personnalisé » → colle l'URL ci-dessus.
          </p>
        </details>
      </section>

      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-2 font-semibold">Données</h2>
        <p className="mb-3 text-sm text-[var(--text-soft)]">
          {noteCount} note(s), {tagCount} tag(s) — stockées localement (IndexedDB).
        </p>
        <button
          onClick={exportAll}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          Exporter tout (JSON)
        </button>
      </section>

      <p className="text-xs text-[var(--text-soft)]">AuraNote v2 — local-first.</p>
    </div>
  );
}
