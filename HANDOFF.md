# AuraNote v2 — Handoff & Architecture

> Document de reprise. À lire en premier avant de retoucher le projet.
> Dernière refonte : réécriture complète (React/Vite/TS + API + extension + connecteur MCP).

---

## 1. Ce que c'est

**AuraNote** = carnet de notes intelligent **local-first** (« second cerveau »). Prise de notes générale (éditeur Markdown, tags libres colorés, épingle/favoris, recherche + palette ⌘K, **canvas infini**) + capture de réponses d'IA (Gemini/Claude/ChatGPT) via Smart Paste, partage mobile, extension navigateur, et **connecteur MCP** (Claude appelle un outil pour enregistrer une note).

Principe fondateur : **la source de vérité est côté client (IndexedDB)**. Le serveur ne fait que **relayer** les captures externes que le client importe puis acquitte.

---

## 2. Architecture (monorepo npm workspaces)

```
racine (package.json: workspaces = packages/*, apps/*)
├── packages/core/      TypeScript partagé : types + moteur de nettoyage/segmentation IA (aucune IA externe)
├── apps/web/           PWA React + Vite + TS + Tailwind v4  ← l'app principale
├── apps/server/        API Express (ingestion + endpoint MCP /mcp) — exécutée via tsx
├── apps/mcp/           Serveur MCP stdio (Claude Desktop local) — optionnel
├── apps/extension/     Extension Chrome MV3 (buildless, JS vanilla)
├── assets/icon.svg     Logo (source de vérité unique)
├── Dockerfile          Build web + run serveur (Railway)
├── railway.json        Config déploiement Railway
└── deploy.sh           Script de déploiement (lit .env → push GitHub)
```

Responsabilités :
- **core** : `parseRawText`, `segmentTextIntoSections`, `cleanAiUiNoise`, `sanitizeHTML`, types `Note/Tag/Canvas`. Utilisé par le web ET le serveur → une seule implémentation.
- **web** : toute l'UI + stockage IndexedDB (Dexie). Consomme `@auranote/core` en source (alias Vite).
- **server** : `/health`, `/api/config`, `/api/v1/notes/ingest`, `/api/v1/sync/push`, `/api/v1/sync/pull`, `/api/v1/tokens`, `/mcp`, et sert `apps/web/dist`.
- **mcp** : pont stdio pour Claude Desktop (le remote HTTP est dans `apps/server` sur `/mcp`).
- **extension** : capture la dernière réponse IA → `POST /api/v1/notes/ingest`.

---

## 3. Stack

- **Front** : React 18, React Router, Zustand (état UI), Dexie (IndexedDB), TipTap + tiptap-markdown (éditeur), MiniSearch (recherche), cmdk (⌘K), @xyflow/react (canvas), vite-plugin-pwa.
- **Tailwind v4** (config dans `apps/web/src/index.css`, tokens `@theme`, thème clair/sombre via classe `.dark`).
- **Serveur** : Express, `@modelcontextprotocol/sdk` (MCP HTTP streamable), exécuté par **tsx** (pas de compilation).
- **Icônes** : jeu SVG maison `apps/web/src/components/icons.tsx` (style Lucide). **Ne pas réintroduire d'emojis** dans l'UI.

---

## 4. Modèle de données

**IndexedDB `AuraNoteDB` v2** (Dexie, `apps/web/src/db/db.ts`) :
- `notes` : `{ id, title, contentMarkdown, sections[], tagIds[], pinned, favorite, source, createdAt, updatedAt, syncState }`
- `tags` : `{ id, name, color }` (5 tags pré-créés = anciennes « Auras »)
- `canvases` : `{ id, name, nodes[], edges[], … }`
- `settings` : préférences

**Serveur (fichiers dans `DATA_DIR`, ex. `/data` sur volume Railway)** :
- `store.json` : hub de synchronisation — `notes`, `tags`, `canvases` (chacun avec `updatedAt` + `deletedAt?`)
- `tokens.json` : tokens / clés de synchro (générés dans Réglages)
> Persistant si `DATA_DIR` pointe sur le **volume Railway** (sinon éphémère, cf. §10).

---

## 5. Flux clés

- **Smart Paste** : texte collé → `parseRawText` (core) → note structurée en IndexedDB.
- **Connecteur / ingestion** : IA (MCP) ou extension → `POST /api/v1/notes/ingest` → crée directement une note dans `store.json` (résout les tags en vrais tags colorés). Les appareils la récupèrent au prochain `sync/pull`.
- **Sync multi-appareils** : chaque appareil `POST /api/v1/sync/push` (ses entités modifiées) puis `GET /api/v1/sync/pull?since=` (LWW sur `updatedAt`, tombstones `deletedAt`). Moteur : [apps/web/src/lib/sync.ts](apps/web/src/lib/sync.ts), déclenché au démarrage/focus/20 s/après mutation.
- **Auth / clé de synchro** : ouverte tant qu'aucun `API_SECRET` ni token n'existe ; sinon Bearer obligatoire. La **clé de synchro = un token** ; gérée dans **Réglages → Synchronisation** (générer/coller) et **Connecteur (MCP)**.

---

## 6. Démarrer en local

```bash
npm install
npm run dev:server     # API :3000
npm run dev            # web :5173 (proxifie /api → :3000)
npm test               # tests du moteur core
```

---

## 7. Déploiement

1. Mettre le token GitHub (expiration courte) dans `.env` (`GITHUB_TOKEN=`).
2. `./deploy.sh` → commit + **force push** sur `main` → Railway rebuild via `Dockerfile`.
3. **Révoquer** le token GitHub ensuite.

Railway : build par `Dockerfile` (install workspaces → `npm run build:web` → `npx tsx apps/server/src/index.ts`). Variables : `PORT` (auto), `API_SECRET` (optionnel), `DATA_DIR` (si volume).

---

## 8. Connecteur MCP (détail)

- **Remote (Railway / claude.ai)** : endpoint `POST /mcp` (streamable HTTP stateless) intégré au serveur. URL = `<origin>/mcp`. Outils : `save_note`, `auranote_status`.
- **Local (Claude Desktop)** : `apps/mcp` en stdio, ou `npx mcp-remote <url>` (voir Réglages → config affichée).
- **Token** : généré dans l'app (Réglages), fourni via `Authorization: Bearer <token>`.

---

## 9. Roadmap — prochaines fonctionnalités

Par priorité suggérée :

### A. Persistance & sync (résout la limite du disque éphémère)
- Base persistante côté serveur (SQLite sur volume Railway, ou Postgres) pour que tokens + captures survivent aux redéploiements.
- Vraie **synchronisation multi-appareils** (push du client vers le serveur, pas seulement pull des captures).

### B. Cœur « second cerveau »
- **Liens `[[entre notes]]` + rétroliens (backlinks)** et vue graphe.
- Recherche sémantique (embeddings) en plus du plein-texte.

### C. Reprise des exigences d'origine (cahier des charges)
- **Sync fichier local `Monidée.md`** via File System Access API.
- **Export PDF** (impression) et export Markdown par note.
- Icônes PWA **PNG 192/512** (installabilité maximale).

### D. Connecteur
- **OAuth** pour le connecteur distant claude.ai (au lieu du simple Bearer).
- Outils MCP additionnels : `search_notes`, `list_recent`, `create_canvas`.

### E. 🐍 Moteur d'enrichissement **Python, IA locale, sans IA externe**
Objectif : améliorer l'intelligence du traitement **sans jamais appeler d'API IA payante/externe** (cohérent avec la souveraineté des données local-first). Un microservice/script Python optionnel, appelé par le serveur pour :
- **auto-tagging** et classification des notes,
- **résumé** et extraction de points clés,
- **détection d'entités**, déduplication, regroupement thématique,
- **embeddings** pour la recherche sémantique.
Mise en œuvre **100 % locale** : `spaCy`, `sentence-transformers`, ou un LLM local via **Ollama / llama.cpp** — aucun réseau vers un fournisseur tiers. Pourquoi : confidentialité, coût nul, fonctionnement hors-ligne, et respect du principe « aucune IA externe » du projet. À packager comme service séparé (ex. `apps/enrichment-py/`) exposant une API locale que le serveur Node interroge, activable par variable d'env.

### F. Confort
- Pièces jointes / images dans les notes.
- Auto-layout du canvas, sélection multiple, groupes.
- Corbeille (soft-delete) au lieu de suppression définitive.

---

## 10. ⛔ Règles STRICTES de déploiement (ne rien casser)

**Avant tout push :**
1. **Toujours** lancer `npm run build` **et** `npm test` en local — un déploiement ne part que si les deux passent (build web + typecheck core/serveur + tests core verts).
2. Tester manuellement le parcours critique en dev (`npm run dev` + `npm run dev:server`) : créer une note, Smart Paste, canvas, générer un token.
3. Vérifier qu'aucun **secret** n'est commité : `.env`, tokens, clés. `.env` est dans `.gitignore` — **ne jamais l'en retirer**. Ne jamais remettre un token dans l'URL du remote git.

**Intégrité de la chaîne de build :**
4. Ne pas modifier le `Dockerfile` sans le tester (`docker build .` en local si possible). Il doit rester : install workspaces → `build:web` → run serveur via `tsx`.
5. Ne pas retirer `tsx` des dépendances du serveur (le serveur s'exécute avec, en prod).
6. Ne pas retirer d'entrée de `.dockerignore` (surtout `node_modules` : copier les node_modules mac dans l'image Linux casse le build).
7. `@auranote/core` est consommé **en source** (alias Vite + tsx). Ne pas casser les chemins d'alias (`vite.config.ts`, `tsconfig` `paths`).

**Données & compat :**
8. Toute évolution du schéma IndexedDB **doit incrémenter `db.version(n)`** dans `db.ts` avec une migration — jamais modifier un store existant sans bump de version (sinon corruption côté utilisateurs).
9. Ne pas changer le **contrat des endpoints** (`/api/v1/notes/ingest`, `/mcp`, `/api/v1/tokens`) sans mettre à jour le connecteur ET l'extension ET le web.

**Déploiement :**
10. Le déploiement se fait **uniquement** via `deploy.sh` (token en `.env`, push, puis révocation du token GitHub).
11. `deploy.sh` fait un **force push** : vérifier qu'on est sur la bonne branche (`main`) et que le travail local est bien celui voulu (`git status`, `git log`) — un force push écrase le distant.
12. Après déploiement : **surveiller le build Railway** (logs). En cas d'échec, ne pas empiler les push — corriger, rebuild local, puis redéployer.
13. Prévoir un **rollback** : noter le dernier commit stable (`git log`) ; en cas de régression, `git revert` ou redeploy du commit précédent.
14. Rappel : le disque Railway est **éphémère** → un redéploiement remet à zéro `tokens.json`/`captures.json`. Prévenir avant de redéployer si des tokens actifs sont utilisés (tant qu'aucun volume n'est configuré, cf. §9-A).

---

## 11. Fichiers à connaître

| Rôle | Fichier |
|---|---|
| Moteur de parsing | `packages/core/src/parser.ts` |
| Schéma & CRUD données | `apps/web/src/db/db.ts` |
| Layout + navigation | `apps/web/src/components/Layout.tsx` |
| Éditeur | `apps/web/src/components/Editor.tsx` |
| Canvas | `apps/web/src/pages/CanvasPage.tsx` |
| Réglages + tokens | `apps/web/src/pages/SettingsPage.tsx` |
| API + auth + MCP | `apps/server/src/index.ts` |
| Tokens serveur | `apps/server/src/tokens.ts` |
| Icônes | `apps/web/src/components/icons.tsx` |
