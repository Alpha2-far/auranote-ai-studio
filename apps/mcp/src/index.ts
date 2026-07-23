#!/usr/bin/env -S npx tsx
/**
 * Serveur MCP AuraNote — expose des outils à Claude (ou tout client MCP) pour
 * enregistrer des notes dans le carnet, via l'API d'ingestion AuraNote.
 *
 * Transport : stdio (compatible Claude Desktop, comme le connecteur Firecrawl).
 * Config Claude Desktop → voir apps/mcp/README.md.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = (process.env.AURANOTE_API_BASE ?? 'http://localhost:3000').replace(/\/$/, '');
const API_SECRET = process.env.AURANOTE_API_SECRET ?? '';

// IMPORTANT : en stdio, stdout est réservé au protocole → logs sur stderr.
const log = (...a: unknown[]) => console.error('[auranote-mcp]', ...a);

async function ingest(body: {
  content: string;
  title?: string;
  tags?: string[];
  source?: string;
}): Promise<{ id: string; title?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_SECRET) headers['Authorization'] = `Bearer ${API_SECRET}`;
  const res = await fetch(`${API_BASE}/api/v1/notes/ingest`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ingestion échouée (${res.status}) ${text}`);
  }
  return res.json() as Promise<{ id: string; title?: string }>;
}

const server = new McpServer({ name: 'auranote', version: '2.0.0' });

server.tool(
  'save_note',
  "Enregistre une note, une idée, une décision ou une synthèse dans le carnet AuraNote de l'utilisateur (son « second cerveau »). Utilise cet outil quand l'utilisateur demande de sauvegarder, mémoriser, archiver ou « mettre dans le carnet ».",
  {
    content: z.string().describe('Le contenu de la note (texte ou Markdown). Sera nettoyé et structuré automatiquement.'),
    title: z.string().optional().describe('Titre optionnel ; extrait automatiquement du contenu si absent.'),
    tags: z.array(z.string()).optional().describe('Étiquettes optionnelles (ex. Stratégie, Technique).'),
  },
  async ({ content, title, tags }) => {
    try {
      const { id, title: savedTitle } = await ingest({ content, title, tags, source: 'Claude (MCP)' });
      return {
        content: [
          { type: 'text', text: `✓ Note enregistrée dans AuraNote : « ${savedTitle ?? title ?? 'Sans titre'} » (id ${id}). Elle apparaîtra dans le carnet à la prochaine ouverture/synchronisation.` },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Échec de l'enregistrement : ${(err as Error).message}` }],
      };
    }
  },
);

server.tool(
  'auranote_status',
  "Vérifie que l'API AuraNote est joignable et renvoie son état.",
  {},
  async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      const data = await res.json();
      return { content: [{ type: 'text', text: `AuraNote joignable (${API_BASE}) : ${JSON.stringify(data)}` }] };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `AuraNote injoignable à ${API_BASE} : ${(err as Error).message}` }],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
log(`Serveur MCP prêt (API cible: ${API_BASE}${API_SECRET ? ', authentifié' : ''}).`);
