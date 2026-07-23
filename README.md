# AuraNote v2

Carnet de notes intelligent et **second cerveau**, local-first. Prise de notes générale (éditeur Markdown riche, tags libres colorés, épingle/favoris, recherche & palette de commandes, **canvas infini**) avec capture des réponses d'IA (Gemini, Claude, ChatGPT) en un clic.

## Architecture (monorepo npm workspaces)

```
packages/core      Types + moteur de nettoyage/segmentation IA (TypeScript, testé)
apps/web           PWA React + Vite + TypeScript + Tailwind v4 (l'app principale)
apps/server        API Express (ingestion des captures + service du build web)
apps/extension     Extension Chrome MV3 (capture 1-clic → API)
assets/icon.svg    Logo (source de vérité unique)
```

- **Local-first** : la source de vérité des notes est **IndexedDB** (via Dexie) dans le navigateur. Le serveur ne fait que **relayer** les captures externes (extension, partage mobile) que le web importe puis acquitte.
- **Stack web** : React 18, React Router, Zustand (état UI), Dexie (stockage), TipTap + tiptap-markdown (éditeur), MiniSearch (recherche), cmdk (palette ⌘K), React Flow (canvas), vite-plugin-pwa (PWA/offline).
- Le code TypeScript (core + serveur) s'exécute via **tsx** — pas d'étape de compilation séparée pour le serveur.

## Démarrer en local

```bash
npm install            # installe tous les workspaces

# Terminal 1 — API (port 3000)
npm run dev:server

# Terminal 2 — web (Vite, port 5173, proxifie /api → 3000)
npm run dev
```

Ouvre http://localhost:5173.

## Build & production

```bash
npm run build          # core (typecheck) + web (dist) + server (typecheck)
npm start              # sert apps/web/dist + l'API sur $PORT (défaut 3000)
```

## Raccourcis

- `⌘/Ctrl + K` — palette de commandes / recherche
- `⌘/Ctrl + J` — Smart Paste (coller une réponse d'IA)

## Capture d'IA

1. **Smart Paste** (dans l'app) : colle un texte → nettoyage des scories UI, extraction du titre, détection des sections/callouts.
2. **Partage mobile** (PWA) : « Partager » depuis Gemini/Claude/ChatGPT → AuraNote (`/share-target`).
3. **Extension** (`apps/extension`, à charger non empaquetée dans `chrome://extensions`) : menu contextuel / popup → `POST /api/v1/notes/ingest`. Configure l'endpoint dans les options de l'extension.

## API serveur

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | Sonde Railway |
| POST | `/api/v1/notes/ingest` | Crée une note depuis `{content,title?,tags?,source?}` (Bearer si auth active) |
| POST | `/api/v1/sync/push` | L'appareil envoie ses entités modifiées → fusion last-write-wins |
| GET | `/api/v1/sync/pull?since=` | L'appareil récupère les changements depuis `since` (tombstones inclus) |
| GET/POST/DELETE | `/api/v1/tokens` | Clés de synchro / tokens du connecteur |
| POST | `/mcp` | Connecteur MCP distant |

## Synchronisation multi-appareils

Le serveur (fichier `store.json` sur le volume) est le **hub**. Chaque appareil garde IndexedDB en cache et fait push/pull (last-write-wins, suppressions par tombstone `deletedAt`). Dans **Réglages → Synchronisation** : génère une clé sur un appareil, colle-la sur les autres.

## Déploiement (Railway)

`Dockerfile` fourni : build du web puis exécution du serveur via `tsx`. Variables : `PORT` (auto), `API_SECRET` (optionnel), `DATA_DIR` = **mount path du volume** (ex. `/data`) pour la persistance.

## Tests

```bash
npm test               # tests du moteur de parsing (packages/core)
```
