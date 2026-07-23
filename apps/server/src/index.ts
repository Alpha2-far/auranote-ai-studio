import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { listCaptures, ackCaptures } from './store';
import { ingestCapture } from './ingest';
import { handleMcpRequest } from './mcp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const HOST = '0.0.0.0';
const API_SECRET = process.env.API_SECRET;
const WEB_DIST = join(__dirname, '..', '..', 'web', 'dist');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

/** Auth Bearer optionnelle (activée seulement si API_SECRET est défini). */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!API_SECRET) return next();
  const header = req.get('authorization') ?? '';
  if (header === `Bearer ${API_SECRET}`) return next();
  res.status(401).json({ error: "Jeton d'authentification invalide." });
}

// Santé (Railway)
app.get('/health', (_req, res) => res.status(200).send('OK'));
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', app: 'AuraNote', port: PORT }),
);

// Infos publiques pour l'écran « Connecteur » côté web (ne divulgue PAS le secret).
app.get('/api/config', (_req, res) =>
  res.json({ mcpPath: '/mcp', ingestPath: '/api/v1/notes/ingest', authRequired: Boolean(API_SECRET) }),
);

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

// Le client local-first récupère les captures en attente…
app.get('/api/v1/notes/pending', requireAuth, async (_req, res) => {
  res.json({ captures: await listCaptures() });
});

// …puis les acquitte une fois importées
app.post('/api/v1/notes/ack', requireAuth, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
  const removed = await ackCaptures(ids);
  res.json({ removed });
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
