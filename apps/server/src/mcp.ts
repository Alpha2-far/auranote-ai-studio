import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { ingestCapture, colorFor } from './ingest';
import { findOrCreateTag, listActive, getEntity, upsertEntity, type SyncEntity } from './syncStore';

const text = (t: string) => ({ content: [{ type: 'text' as const, text: t }] });
const fail = (t: string) => ({ isError: true, content: [{ type: 'text' as const, text: t }] });
const now = () => new Date().toISOString();

/** Construit une instance de serveur MCP AuraNote (notes, tags, canvas, recherche). */
function buildMcpServer(): McpServer {
  const server = new McpServer({ name: 'auranote', version: '2.0.0' });

  server.tool(
    'save_note',
    [
      "Enregistre une note dans le carnet AuraNote de l'utilisateur (son « second cerveau »).",
      "Utilise-le quand l'utilisateur demande de sauvegarder, mémoriser, archiver ou « mettre dans le carnet ».",
      'RÉDIGE `content` en Markdown bien structuré : `## Titre`, `- item`, `- [ ] tâche`, `> citation`, `**gras**`, blocs de code.',
      'Donne un `title` clair et 2 à 5 `tags` courts.',
    ].join('\n'),
    {
      content: z.string().describe('Contenu en Markdown structuré (titres, listes, cases à cocher, citations, code).'),
      title: z.string().optional().describe('Titre clair ; extrait du contenu si absent.'),
      tags: z.array(z.string()).optional().describe('2 à 5 étiquettes courtes, créées/assignées automatiquement.'),
    },
    async ({ content, title, tags }) => {
      try {
        const { id, title: saved } = await ingestCapture({ content, title, tags, source: 'MCP' });
        return text(`✓ Note enregistrée : « ${saved} » (id ${id}).`);
      } catch (err) {
        return fail(`Échec : ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    'list_tags',
    "Liste les étiquettes (tags) existantes du carnet, avec leur couleur.",
    {},
    async () => {
      const tags = await listActive('tags');
      if (!tags.length) return text('Aucun tag.');
      return text(tags.map((t) => `• ${t.name} (${t.color}) [${t.id}]`).join('\n'));
    },
  );

  server.tool(
    'create_tag',
    "Crée une étiquette (ou renvoie l'existante de même nom). Utile avant de classer des notes.",
    {
      name: z.string().describe('Nom du tag.'),
      color: z.string().optional().describe('Couleur hex (#RRGGBB). Sinon dérivée du nom.'),
    },
    async ({ name, color }) => {
      const id = await findOrCreateTag(name, color || colorFor(name));
      return text(`✓ Tag « ${name} » prêt (id ${id}).`);
    },
  );

  server.tool(
    'search_notes',
    "Recherche des notes par mot-clé (titre + contenu). Renvoie les correspondances (id + titre).",
    { query: z.string().describe('Terme recherché.') },
    async ({ query }) => {
      const q = query.toLowerCase().trim();
      const notes = await listActive('notes');
      const hits = notes
        .filter(
          (n) =>
            String(n.title ?? '').toLowerCase().includes(q) ||
            String(n.contentMarkdown ?? '').toLowerCase().includes(q),
        )
        .slice(0, 10);
      if (!hits.length) return text(`Aucune note pour « ${query} ».`);
      return text(hits.map((n) => `• ${n.title} [${n.id}]`).join('\n'));
    },
  );

  server.tool(
    'create_canvas',
    "Crée un canvas (tableau infini) pour organiser des cartes reliées. Renvoie son id.",
    { name: z.string().describe('Nom du canvas.') },
    async ({ name }) => {
      const id = randomUUID();
      const ts = now();
      await upsertEntity('canvases', {
        id,
        name,
        nodes: [],
        edges: [],
        createdAt: ts,
        updatedAt: ts,
        deletedAt: null,
      } as SyncEntity);
      return text(`✓ Canvas « ${name} » créé (id ${id}). Ajoute des cartes avec add_canvas_node.`);
    },
  );

  server.tool(
    'add_canvas_node',
    "Ajoute une carte à un canvas : soit du texte libre, soit une référence à une note existante. Renvoie l'id du nœud.",
    {
      canvasId: z.string().describe('Id du canvas (voir create_canvas).'),
      text: z.string().optional().describe('Texte de la carte (si carte libre).'),
      noteId: z.string().optional().describe("Id d'une note à référencer (voir search_notes)."),
    },
    async ({ canvasId, text: nodeText, noteId }) => {
      const canvas = await getEntity('canvases', canvasId);
      if (!canvas || canvas.deletedAt) return fail('Canvas introuvable.');
      const nodes = Array.isArray(canvas.nodes) ? (canvas.nodes as Array<Record<string, unknown>>) : [];
      const i = nodes.length;
      const nodeId = randomUUID();
      nodes.push({
        id: nodeId,
        text: nodeText,
        noteId,
        x: 120 + (i % 5) * 60,
        y: 120 + i * 40,
        w: 176,
        h: 120,
      });
      await upsertEntity('canvases', { ...canvas, nodes, updatedAt: now() });
      return text(`✓ Carte ajoutée au canvas (id ${nodeId}).`);
    },
  );

  server.tool(
    'link_canvas_nodes',
    'Relie deux cartes d\'un canvas par une flèche.',
    {
      canvasId: z.string(),
      sourceId: z.string().describe('Id du nœud source.'),
      targetId: z.string().describe('Id du nœud cible.'),
    },
    async ({ canvasId, sourceId, targetId }) => {
      const canvas = await getEntity('canvases', canvasId);
      if (!canvas || canvas.deletedAt) return fail('Canvas introuvable.');
      const edges = Array.isArray(canvas.edges) ? (canvas.edges as Array<Record<string, unknown>>) : [];
      edges.push({ id: randomUUID(), source: sourceId, target: targetId });
      await upsertEntity('canvases', { ...canvas, edges, updatedAt: now() });
      return text('✓ Cartes reliées.');
    },
  );

  server.tool('auranote_status', "État de l'API AuraNote.", {}, async () => text('AuraNote opérationnel.'));

  return server;
}

/**
 * Gère une requête MCP en HTTP « streamable » sans session (stateless) :
 * un serveur + transport neufs par requête. Adapté à un hébergement Railway.
 */
export async function handleMcpRequest(req: Request, res: Response): Promise<void> {
  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
