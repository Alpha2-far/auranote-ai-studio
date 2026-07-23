# @auranote/mcp — Connecteur MCP pour Claude

Expose le carnet AuraNote comme **connecteur** à Claude (ou tout client MCP), à la manière de Firecrawl. Claude peut alors enregistrer des notes dans ton carnet sur simple demande (« mets ça dans mon carnet », « résume nos décisions et sauvegarde-les »).

## Outils exposés

- **`save_note`** `{ content, title?, tags? }` — enregistre une note (nettoyée et structurée) via l'API d'ingestion AuraNote.
- **`auranote_status`** — vérifie que l'API est joignable.

## Prérequis

L'API AuraNote doit tourner (locale `npm run dev:server`, ou l'URL Railway déployée).

## Configuration — Claude Desktop

Édite `claude_desktop_config.json` (menu Réglages → Développeur → Modifier la config) :

```json
{
  "mcpServers": {
    "auranote": {
      "command": "npx",
      "args": ["-y", "tsx", "/CHEMIN/VERS/Mon bloc note/apps/mcp/src/index.ts"],
      "env": {
        "AURANOTE_API_BASE": "http://localhost:3000",
        "AURANOTE_API_SECRET": ""
      }
    }
  }
}
```

Remplace le chemin par le chemin absolu réel. Renseigne `AURANOTE_API_SECRET` uniquement si le serveur a été démarré avec `API_SECRET`. Redémarre Claude Desktop : l'outil **AuraNote** apparaît dans la liste des connecteurs.

## Test rapide (sans Claude)

```bash
npm run start --workspace @auranote/mcp   # démarre le serveur MCP en stdio
```

Le serveur écrit son état sur **stderr** (stdout est réservé au protocole MCP).

## Remote (Railway / claude.ai)

Pour un connecteur distant (HTTP), pointe `AURANOTE_API_BASE` vers l'URL Railway. Un transport HTTP/SSE pourra être ajouté ultérieurement pour les connecteurs claude.ai qui exigent un serveur MCP distant.
