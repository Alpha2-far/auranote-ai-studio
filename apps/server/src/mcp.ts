import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import type { Request, Response } from 'express';
import { ingestCapture } from './ingest';

/** Construit une instance de serveur MCP AuraNote (outils save_note / auranote_status). */
function buildMcpServer(): McpServer {
  const server = new McpServer({ name: 'auranote', version: '2.0.0' });

  server.tool(
    'save_note',
    "Enregistre une note, une idée, une décision ou une synthèse dans le carnet AuraNote de l'utilisateur (son « second cerveau »). Utilise cet outil quand l'utilisateur demande de sauvegarder, mémoriser, archiver ou « mettre dans le carnet ».",
    {
      content: z.string().describe('Le contenu de la note (texte ou Markdown), nettoyé et structuré automatiquement.'),
      title: z.string().optional().describe('Titre optionnel ; extrait du contenu si absent.'),
      tags: z.array(z.string()).optional().describe('Étiquettes optionnelles.'),
    },
    async ({ content, title, tags }) => {
      try {
        const { id, title: saved } = await ingestCapture({ content, title, tags, source: 'Claude (MCP)' });
        return {
          content: [
            { type: 'text', text: `✓ Note enregistrée dans AuraNote : « ${saved} » (id ${id}).` },
          ],
        };
      } catch (err) {
        return { isError: true, content: [{ type: 'text', text: `Échec : ${(err as Error).message}` }] };
      }
    },
  );

  server.tool('auranote_status', "État de l'API AuraNote.", {}, async () => ({
    content: [{ type: 'text', text: 'AuraNote opérationnel.' }],
  }));

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
