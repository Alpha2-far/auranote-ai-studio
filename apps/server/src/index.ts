import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { ingestCapture } from './ingest';
import { handleMcpRequest } from './mcp';
import { createToken, listTokens, revokeToken, validateToken, activeTokenCount } from './tokens';
import { mergeEntities, changedSince, type Collection, type SyncEntity } from './syncStore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = '0.0.0.0';
const API_SECRET = process.env.API_SECRET;
const WEB_DIST = join(__dirname, '..', '..', 'web', 'dist');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

/**
 * Auth Bearer. Ouverte tant qu'aucun secret n'est configuré NI aucun token créé.
 * Dès qu'un API_SECRET (env) ou un token in-app existe, un Bearer valide est exigé.
 */
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.get('authorization') ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';

  const hasTokens = (await activeTokenCount()) > 0;
  if (!API_SECRET && !hasTokens) return next(); // aucune auth configurée → ouvert

  if (API_SECRET && bearer === API_SECRET) return next();
  if (bearer && (await validateToken(bearer))) return next();

  res.status(401).json({ error: "Jeton d'authentification invalide." });
}

// Santé (Railway)
app.get('/health', (_req, res) => res.status(200).send('OK'));
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', app: 'AuraNote', port: PORT }),
);

// Infos publiques pour l'écran « Connecteur » côté web (ne divulgue PAS le secret).
app.get('/api/config', async (_req, res) => {
  const tokens = await activeTokenCount();
  res.json({
    mcpPath: '/mcp',
    ingestPath: '/api/v1/notes/ingest',
    envSecret: Boolean(API_SECRET),
    tokenCount: tokens,
    authRequired: Boolean(API_SECRET) || tokens > 0,
  });
});

// Gestion des tokens de connecteur (générés depuis l'app — pas de config Railway).
app.get('/api/v1/tokens', async (_req, res) => res.json({ tokens: await listTokens() }));
app.post('/api/v1/tokens', async (req, res) => {
  const { label, expiresInDays } = req.body ?? {};
  const token = await createToken(
    typeof label === 'string' ? label : 'Connecteur',
    typeof expiresInDays === 'number' ? expiresInDays : undefined,
  );
  // Le token complet n'est renvoyé qu'ici, à la création.
  res.status(201).json({ id: token.id, token: token.token, label: token.label, expiresAt: token.expiresAt });
});
app.delete('/api/v1/tokens/:id', async (req, res) => {
  const ok = await revokeToken(req.params.id);
  res.json({ revoked: ok });
});

// Ingestion d'une capture (extension, script, ordre IA)
app.post('/api/v1/notes/ingest', requireAuth, async (req, res) => {
  const { content, title, tags, source } = req.body ?? {};
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Le champ content est requis.' });
  }
  const { id, title: savedTitle } = await ingestCapture({
    content,
    title: typeof title === 'string' ? title : undefined,
    tags,
    source: typeof source === 'string' ? source : 'ingest',
  });
  res.status(201).json({ message: 'Capture reçue.', id, title: savedTitle });
});

// Connecteur MCP distant (Claude / claude.ai) — hébergé avec le reste sur Railway.
app.post('/mcp', requireAuth, handleMcpRequest);
app.get('/mcp', (_req, res) =>
  res.status(405).json({ error: 'Utiliser POST (MCP streamable HTTP, stateless).' }),
);

// --- Synchronisation multi-appareils (serveur = hub, last-write-wins) ---
const COLLECTIONS: Collection[] = ['notes', 'tags', 'canvases', 'folders'];

// Le client envoie ses entités modifiées → fusion LWW dans le store du volume.
app.post('/api/v1/sync/push', requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as Partial<Record<Collection, SyncEntity[]>>;
  for (const c of COLLECTIONS) {
    if (Array.isArray(body[c])) await mergeEntities(c, body[c] as SyncEntity[]);
  }
  res.json({ ok: true, serverTime: new Date().toISOString() });
});

// Le client récupère tout ce qui a changé depuis `since` (tombstones inclus).
app.get('/api/v1/sync/pull', requireAuth, async (req, res) => {
  const since = typeof req.query.since === 'string' ? req.query.since : undefined;
  const changes = await changedSince(since);
  res.json({ changes, serverTime: new Date().toISOString() });
});

// Fichiers statiques du web (build Vite) + fallback SPA
if (existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(WEB_DIST, 'index.html'));
  });
}

app.listen(PORT, HOST, () => {
  console.log(`AuraNote server → http://${HOST}:${PORT} (web dist: ${existsSync(WEB_DIST) ? 'ok' : 'absent'})`);
});
