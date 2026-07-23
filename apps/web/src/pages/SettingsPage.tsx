import { useCallback, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useUI } from '../store/useUI';
import { IconSun, IconMoon, IconTrash } from '../components/icons';
import { getSyncKey, setSyncKey, syncNow, resetSyncWatermark, useSyncStatus } from '../lib/sync';

const apiOrigin = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

interface TokenPublic {
  id: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  preview: string;
  expired: boolean;
}

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
  const noteCount = useLiveQuery(() => db.notes.filter((n) => !n.deletedAt).count(), [], 0);
  const tagCount = useLiveQuery(() => db.tags.filter((t) => !t.deletedAt).count(), [], 0);
  const [serverUp, setServerUp] = useState<boolean | null>(null);
  const [tokens, setTokens] = useState<TokenPublic[]>([]);
  const [label, setLabel] = useState('Claude');
  const [expiry, setExpiry] = useState('7');
  const [newToken, setNewToken] = useState<string | null>(null);

  // --- Synchronisation ---
  const syncStatus = useSyncStatus();
  const [hasKey, setHasKey] = useState(Boolean(getSyncKey()));
  const [pasteKey, setPasteKey] = useState('');
  const [genKey, setGenKey] = useState<string | null>(null);

  const generateSyncKey = async () => {
    const res = await fetch(`${apiOrigin}/api/v1/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Clé de synchro' }),
    });
    const data = await res.json();
    setSyncKey(data.token);
    resetSyncWatermark();
    setGenKey(data.token);
    setHasKey(true);
    await syncNow();
    await refreshTokens();
  };

  const connectWithKey = async () => {
    if (!pasteKey.trim()) return;
    setSyncKey(pasteKey);
    resetSyncWatermark();
    setPasteKey('');
    setHasKey(true);
    await syncNow();
  };

  const disconnectSync = () => {
    setSyncKey('');
    resetSyncWatermark();
    setGenKey(null);
    setHasKey(false);
  };

  const refreshTokens = useCallback(async () => {
    try {
      const [cfg, list] = await Promise.all([
        fetch(`${apiOrigin}/api/config`).then((r) => r.json()),
        fetch(`${apiOrigin}/api/v1/tokens`).then((r) => r.json()),
      ]);
      setServerUp(true);
      void cfg;
      setTokens(list.tokens ?? []);
    } catch {
      setServerUp(false);
    }
  }, []);

  useEffect(() => {
    void refreshTokens();
  }, [refreshTokens]);

  const generateToken = async () => {
    const days = expiry === 'never' ? undefined : Number(expiry);
    const res = await fetch(`${apiOrigin}/api/v1/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, expiresInDays: days }),
    });
    const data = await res.json();
    setNewToken(data.token);
    await refreshTokens();
  };

  const revoke = async (id: string) => {
    await fetch(`${apiOrigin}/api/v1/tokens/${id}`, { method: 'DELETE' });
    await refreshTokens();
  };

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

      {/* Synchronisation multi-appareils */}
      <section className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-1 font-semibold">Synchronisation multi-appareils</h2>
        <p className="mb-3 text-sm text-[var(--text-soft)]">
          Retrouve tes notes, tags et canvas sur tous tes appareils. Génère une clé ici, puis colle-la
          sur ton autre appareil.
        </p>

        {!hasKey ? (
          <>
            <button
              onClick={generateSyncKey}
              className="mb-3 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600"
            >
              Générer une clé de synchro
            </button>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-[var(--text-soft)]">
                  …ou colle une clé existante (autre appareil)
                </label>
                <input
                  value={pasteKey}
                  onChange={(e) => setPasteKey(e.target.value)}
                  placeholder="ant_…"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-sm outline-none focus:border-brand-500"
                />
              </div>
              <button
                onClick={connectWithKey}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              >
                Connecter
              </button>
            </div>
          </>
        ) : (
          <>
            {genKey && (
              <div className="mb-3 rounded-lg border border-brand-500/40 bg-brand-500/10 p-3">
                <div className="mb-1 text-sm font-semibold">
                  ✓ Ta clé de synchro — copie-la sur tes autres appareils
                </div>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded bg-black/10 px-2 py-1 text-xs dark:bg-white/10">
                    {genKey}
                  </code>
                  <CopyButton text={genKey} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                ● Synchro active
              </span>
              <button
                onClick={() => void syncNow()}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
              >
                ↻ Synchroniser maintenant
              </button>
              <button
                onClick={disconnectSync}
                className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
              >
                Déconnecter cet appareil
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--text-soft)]">
              {syncStatus?.ok
                ? syncStatus.pulled
                  ? `Dernière synchro : ${syncStatus.pulled} élément(s) reçu(s).`
                  : 'À jour.'
                : syncStatus?.reason === 'unauthorized'
                  ? 'Clé invalide — reconnecte-toi.'
                  : syncStatus?.reason === 'offline'
                    ? 'Serveur injoignable (mode local).'
                    : 'En attente de synchro…'}
            </p>
          </>
        )}
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

        <div className="mb-3 rounded-lg border border-[var(--border)] p-3">
          <div className="mb-2 font-semibold">Tokens d'accès</div>
          {serverUp === false ? (
            <p className="text-sm text-[var(--text-soft)]">Serveur injoignable.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-[var(--text-soft)]">
                Génère un token à coller dans le connecteur. Tant qu'aucun token n'existe, l'ingestion est
                ouverte ; dès qu'un token existe, il devient obligatoire.
              </p>

              {newToken && (
                <div className="mb-3 rounded-lg border border-brand-500/40 bg-brand-500/10 p-3">
                  <div className="mb-1 text-sm font-semibold">
                    ✓ Nouveau token — copie-le maintenant (non réaffiché ensuite)
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded bg-black/10 px-2 py-1 text-xs dark:bg-white/10">
                      {newToken}
                    </code>
                    <CopyButton text={newToken} />
                  </div>
                </div>
              )}

              <div className="mb-3 flex flex-wrap items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-[var(--text-soft)]">Nom</label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-soft)]">Expiration</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                  >
                    <option value="1">1 jour</option>
                    <option value="7">7 jours</option>
                    <option value="30">30 jours</option>
                    <option value="never">Jamais</option>
                  </select>
                </div>
                <button
                  onClick={generateToken}
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-[#0D0F12] hover:bg-brand-600"
                >
                  Générer
                </button>
              </div>

              {tokens.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {tokens.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-sm"
                    >
                      <span className="font-medium">{t.label}</span>
                      <code className="text-xs text-[var(--text-soft)]">{t.preview}</code>
                      <span className="text-xs text-[var(--text-soft)]">
                        {t.expired
                          ? '· expiré'
                          : t.expiresAt
                            ? `· exp. ${new Date(t.expiresAt).toLocaleDateString('fr-FR')}`
                            : '· sans expiration'}
                      </span>
                      <button
                        onClick={() => revoke(t.id)}
                        className="ml-auto rounded-lg p-1 text-[var(--text-soft)] hover:bg-red-500/10 hover:text-red-500"
                        title="Révoquer"
                      >
                        <IconTrash size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
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
