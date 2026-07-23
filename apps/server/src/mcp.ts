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
    [
      "Enregistre une note dans le carnet AuraNote de l'utilisateur (son « second cerveau »).",
      "Utilise-le quand l'utilisateur demande de sauvegarder, mémoriser, archiver ou « mettre dans le carnet ».",
      'RÉDIGE `content` en Markdown bien structuré :',
      '- titres de section : `## Titre`',
      '- listes à puces : `- item`',
      '- cases à cocher : `- [ ] tâche`',
      '- citations : `> …`  ·  gras : `**…**`  ·  code : bloc ``` ```',
      'Donne un `title` clair et 2 à 5 `tags` courts (ex. Stratégie, Technique, Idées).',
    ].join('\n'),
    {
      content: z.string().describe('Contenu de la note en Markdown structuré (titres, listes, cases à cocher, citations, code).'),
      title: z.string().optional().describe('Titre clair de la note ; extrait du contenu si absent.'),
      tags: z.array(z.string()).optional().describe('2 à 5 étiquettes courtes. Créées/assignées automatiquement.'),
    },
    async ({ content, title, tags }) => {
      try {
        const { id, title: saved } = await ingestCapture({ content, title, tags, source: 'MCP' });
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
