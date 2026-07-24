# AuraNote v2 — Handoff & Architecture

> Document de reprise. À lire en premier avant de retoucher le projet.
> État : refonte complète (React/Vite/TS) + **M1 sync multi-appareils** + **M2 connecteur enrichi** + **M3 canvas type n8n avec moteur d'exécution** + **M4 arborescence (dossiers)** + **moteur d'enrichissement Python local**, tous livrés et déployés.

---

## 1. Ce que c'est

**AuraNote** = carnet de notes intelligent **local-first** (« second cerveau »), synchronisé entre appareils. Prise de notes générale (éditeur Markdown, tags libres colorés, **dossiers**, épingle/favoris, recherche + palette ⌘K) + un **canvas infini avec nœuds typés et moteur d'exécution** (façon n8n) + capture de réponses d'IA via Smart Paste, partage mobile, extension navigateur, et un **connecteur MCP** riche (Claude/ChatGPT peuvent créer des notes, tags, dossiers, canvas et les relier).

Principe fondateur : **IndexedDB (client) reste la source locale**, mais le **serveur est désormais un hub de synchronisation** (pas un simple relais) — voir §5.

---

## 2. Architecture (monorepo npm workspaces)

```
racine (package.json: workspaces = packages/*, apps/*)
├── packages/core/        TypeScript partagé : types + moteur de nettoyage/segmentation (aucune IA externe)
├── apps/web/             PWA React + Vite + TS + Tailwind v4  ← l'app principale
├── apps/server/          API Express (ingestion, sync, tokens, endpoint MCP /mcp) — exécutée via tsx
├── apps/mcp/             Serveur MCP stdio (Claude Desktop local) — optionnel, doublon léger du /mcp serveur
├── apps/extension/       Extension Chrome MV3 (buildless, JS vanilla)
├── apps/enrichment-py/   Moteur d'enrichissement Python — 100% stdlib, AUCUNE IA externe, optionnel
├── assets/icon.svg       Logo (source de vérité unique)
├── Dockerfile            Build web + run serveur (Railway)
├── railway.json          Config déploiement Railway
└── deploy.sh             Script de déploiement (lit .env → push GitHub force)
```

Responsabilités :
- **core** : `parseRawText`, `segmentTextIntoSections`, `cleanAiUiNoise`, `sanitizeHTML`, types `Note/Tag/Folder/Canvas/CanvasNode/CanvasEdge`. Utilisé par le web ET le serveur.
- **web** : toute l'UI + stockage IndexedDB (Dexie, schéma v4) + moteur de sync + moteur d'exécution de canvas.
- **server** : `/health`, `/api/config`, `/api/v1/notes/ingest`, `/api/v1/sync/push`, `/api/v1/sync/pull`, `/api/v1/tokens`, `/mcp`, sert `apps/web/dist`.
- **mcp** : pont stdio pour Claude Desktop (le remote HTTP « source de vérité » des outils est dans `apps/server/src/mcp.ts` sur `/mcp` — si tu ajoutes un outil, **mets-le à jour aux deux endroits** ou déprécie `apps/mcp`).
- **extension** : capture la dernière réponse IA → `POST /api/v1/notes/ingest`.
- **enrichment-py** : optionnel, non branché par défaut (opt-in via env) — voir §9.

---

## 3. Stack

- **Front** : React 18, React Router, Zustand (état UI), Dexie (IndexedDB), TipTap + tiptap-markdown (éditeur), MiniSearch (recherche), cmdk (⌘K), **@xyflow/react** (canvas + moteur de nœuds), vite-plugin-pwa.
- **Tailwind v4** (config dans `apps/web/src/index.css`, tokens `@theme`, thème clair/sombre via classe `.dark`).
- **Serveur** : Express, `@modelcontextprotocol/sdk` (MCP HTTP streamable, stateless), exécuté par **tsx** (pas de compilation).
- **Icônes** : jeu SVG maison `apps/web/src/components/icons.tsx` (style Lucide). **Ne pas réintroduire d'emojis** dans l'UI (le panneau de config des nœuds de canvas fait encore une exception mineure pour 🗂 — à nettoyer si l'occasion se présente).
- **Python** (optionnel) : stdlib uniquement, aucune dépendance externe, aucun appel réseau IA.

---

## 4. Modèle de données

**IndexedDB `AuraNoteDB` v4** (Dexie, `apps/web/src/db/db.ts`) :
- `notes` : `{ id, title, contentMarkdown, sections[], tagIds[], folderId?, pinned, favorite, source, createdAt, updatedAt, syncState, deletedAt? }`
- `tags` : `{ id, name, color, updatedAt?, deletedAt? }` (5 tags pré-créés = anciennes « Auras »)
- `folders` : `{ id, name, parentId?, updatedAt?, deletedAt? }` — arborescence plate pour l'instant (parentId prévu, UI non hiérarchique encore)
- `canvases` : `{ id, name, nodes[], edges[], createdAt, updatedAt, deletedAt? }`
  - `CanvasNode` : `{ id, kind?: 'card'|'trigger'|'if'|'action', label?, text?, noteId?, config?, x, y, w, h }`
  - `CanvasEdge` : `{ id, source, target, sourceHandle?: 'true'|'false'|null }`
- `settings` : préférences
- **Tout est soft-delete** (`deletedAt`) pour la synchronisation — jamais de suppression physique sur une entité synchronisée. Migrations v2→v3 (deletedAt) et v3→v4 (folderId) dans `db.ts`.

**Serveur (fichiers dans `DATA_DIR`, ex. `/data` sur volume Railway)** :
- `store.json` : hub de synchronisation — collections `notes`, `tags`, `canvases`, `folders` (chacune avec `updatedAt` + `deletedAt?`), voir `apps/server/src/syncStore.ts`
- `tokens.json` : tokens / clés de synchro (générés dans Réglages), voir `apps/server/src/tokens.ts`
> Persistant **uniquement si** `DATA_DIR` pointe sur le volume Railway (idéalement `${{RAILWAY_VOLUME_MOUNT_PATH}}`, cf. §7 et §10).

---

## 5. Flux clés

- **Smart Paste** : texte collé → `parseRawText` (core) → note structurée en IndexedDB.
- **Ingestion connecteur/extension** : `POST /api/v1/notes/ingest` (`{content, title?, tags?, folder?, source?}`) → crée **directement** une note dans `store.json`, résout `tags`/`folder` en vraies entités (find-or-create). Les appareils la récupèrent au prochain `sync/pull`. Plus de file `pending/ack` (supprimée en M1).
- **Synchronisation multi-appareils** (`apps/web/src/lib/sync.ts`) : chaque appareil `POST /api/v1/sync/push` (entités locales modifiées) puis `GET /api/v1/sync/pull?since=` (merge **last-write-wins** sur `updatedAt`, tombstones `deletedAt`). Déclenché au démarrage, au focus, toutes les ~20s, et après chaque mutation locale (via `apps/web/src/lib/syncBus.ts`, debounce ~800ms).
- **Clé de synchro / token** : ouverte tant qu'aucun `API_SECRET` (env) ni token in-app n'existe ; sinon Bearer obligatoire sur tout endpoint protégé. Générée/collée dans **Réglages → Synchronisation** (multi-appareils) et **Réglages → Connecteur (MCP)** (même mécanisme de token, cf. `apps/server/src/tokens.ts`).
- **Canvas — construction** : cartes/nœuds typés posés à la main ou via le connecteur MCP (`create_canvas`, `add_canvas_node`, `link_canvas_nodes`).
- **Canvas — exécution** (`apps/web/src/canvas/engine.ts`, bouton « Exécuter », manuel uniquement) : part des nœuds `trigger` (scope = toutes les notes ou notes taguées), traverse le graphe, évalue les nœuds `if` (tag / titre contient / favori / épinglée) en suivant la branche `true`/`false`, applique les nœuds `action` (ajouter/retirer tag, épingler/désépingler, favori/retrait, **déplacer vers un dossier**, créer une note récap). Tourne 100% côté client sur IndexedDB, aucune IA.

---

## 6. Démarrer en local

```bash
npm install
npm run dev:server     # API :3000
npm run dev            # web :5173 (proxifie /api → :3000)
npm test               # tests du moteur core (TS)
```

**Python (optionnel)** :
```bash
cd apps/enrichment-py
python3 -m unittest discover -s tests -v   # 20 tests
python3 cli.py note.md --json
```

---

## 7. Déploiement

1. Mettre le token GitHub (expiration courte) dans `.env` (`GITHUB_TOKEN=`).
2. `./deploy.sh` → commit + **force push** sur `main` → Railway rebuild via `Dockerfile`.
3. **Révoquer** le token GitHub ensuite.

Railway : build par `Dockerfile` (install workspaces → `npm run build:web` → `npx tsx apps/server/src/index.ts`). Variables : `PORT` (auto), `API_SECRET` (optionnel), **`DATA_DIR` = `${{RAILWAY_VOLUME_MOUNT_PATH}}`** (obligatoire pour la persistance si un volume est attaché — sinon `store.json`/`tokens.json` sont réinitialisés à chaque déploiement).

---

## 8. Connecteur MCP (détail)

- **Remote (Railway / claude.ai / ChatGPT)** : endpoint `POST /mcp` (streamable HTTP stateless, un serveur+transport neufs par requête) dans `apps/server/src/mcp.ts`. URL = `<origin>/mcp`.
- **Local (Claude Desktop)** : `apps/mcp` en stdio, ou `npx mcp-remote <url>` (config affichée dans Réglages).
- **Token** : généré dans l'app (Réglages → Synchronisation ou Connecteur), fourni via `Authorization: Bearer <token>`.
- **Outils exposés** (tous dans `apps/server/src/mcp.ts`) :
  | Outil | Rôle |
  |---|---|
  | `save_note` | Crée une note (Markdown riche : titres/listes/cases à cocher/citations/code) + `tags?` + `folder?` |
  | `list_tags` / `create_tag` | Liste / crée un tag coloré (find-or-create) |
  | `create_folder` | Crée un dossier (find-or-create) |
  | `search_notes` | Recherche titre+contenu, jusqu'à 10 résultats |
  | `create_canvas` | Crée un canvas vide |
  | `add_canvas_node` | Ajoute un nœud (`kind`: card/trigger/if/action, `label`, `text?`, `noteId?`) |
  | `link_canvas_nodes` | Relie deux nœuds (`branch`: true/false pour les `if`) |
  | `auranote_status` | Sonde de disponibilité |
- ⚠️ Après tout ajout/changement d'outil, **rafraîchir le connecteur côté client IA** (ChatGPT/Claude) pour qu'il redécouvre le schéma.

---

## 9. Moteur d'enrichissement Python (`apps/enrichment-py/`)

**100% stdlib, aucune dépendance, aucun appel réseau vers une IA externe.** Fournit : nettoyage des scories UI, segmentation en sections/encadrés, extraction de mots-clés (fréquence, stopwords FR/EN), résumé extractif (scoring de phrases par densité de mots-clés), classification par « Aura » + tags suggérés.

- Bibliothèque : `from auranote_enrich import enrich`.
- CLI : `python3 cli.py [--json|--summary|--keywords] [fichier|texte|stdin]`.
- Tests : `python3 -m unittest discover -s tests` (20 tests).
- **Non branché au serveur Node par défaut** — c'est un outil autonome. Pour l'intégrer : lancer en sous-processus (`child_process`) depuis `apps/server`, activé par une variable d'env (ex. `ENRICH_CMD`), jamais appelé automatiquement sans opt-in explicite.

---

## 10. Roadmap — prochaines pistes

### Fait ✅ (ne pas re-proposer)
- Sync multi-appareils (push/pull, clé de synchro, LWW, tombstones) — M1.
- Connecteur enrichi (tags, dossiers, canvas, recherche) — M2.
- Canvas type n8n avec nœuds typés + moteur d'exécution manuel — M3.
- Arborescence (dossiers) + filtrage + action canvas « déplacer vers dossier » — M4.
- Moteur d'enrichissement Python local (sans IA externe) — voir §9.

### Restant, par priorité suggérée
**A. Cœur « second cerveau »**
- Liens `[[entre notes]]` + rétroliens (backlinks) et vue graphe.
- Recherche sémantique (embeddings locaux) en complément du plein-texte MiniSearch.
- Sous-dossiers réels dans l'UI (le modèle `parentId` existe déjà, l'arborescence affichée est plate).

**B. Reprise des exigences d'origine (cahier des charges)**
- Sync fichier local `Monidée.md` via File System Access API.
- Export PDF (impression) et export Markdown par note.
- Icônes PWA PNG 192/512 (aujourd'hui SVG seul).

**C. Connecteur & exécution**
- OAuth pour le connecteur distant claude.ai (au lieu du Bearer simple).
- Déclenchement **automatique** de canvas (sur événement : création/tag d'une note), en plus du mode manuel actuel.
- Brancher `apps/enrichment-py` au serveur Node (opt-in) pour enrichir les captures IA (auto-tag, résumé) avant sync.

**D. Confort**
- Pièces jointes / images dans les notes.
- Auto-layout du canvas, sélection multiple, groupes de nœuds.
- Persistance serveur plus robuste que fichiers JSON (SQLite) si la volumétrie grossit.

---

## 11. ⛔ Règles STRICTES de déploiement (ne rien casser)

**Avant tout push :**
1. **Toujours** lancer `npm run build` **et** `npm test` en local (build web + typecheck core/serveur + tests core JS). Si le Python a été touché, lancer aussi `python3 -m unittest discover -s tests` dans `apps/enrichment-py`.
2. Tester manuellement le parcours critique en dev (`npm run dev` + `npm run dev:server`) : créer une note, Smart Paste, canvas (ajouter nœuds + exécuter), dossier, générer un token/clé de sync.
3. Vérifier qu'aucun **secret** n'est commité : `.env`, tokens, clés. `.env` est dans `.gitignore` — **ne jamais l'en retirer**. Ne jamais remettre un token dans l'URL du remote git.

**Intégrité de la chaîne de build :**
4. Ne pas modifier le `Dockerfile` sans le tester. Il doit rester : install workspaces → `build:web` → run serveur via `tsx`.
5. Ne pas retirer `tsx` des dépendances du serveur (le serveur s'exécute avec, en prod).
6. Ne pas retirer d'entrée de `.dockerignore` (surtout `node_modules` : copier les node_modules mac dans l'image Linux casse le build).
7. `@auranote/core` est consommé **en source** (alias Vite + tsx). Ne pas casser les chemins d'alias (`vite.config.ts`, `tsconfig` `paths`).

**Données & compat :**
8. Toute évolution du schéma IndexedDB **doit incrémenter `db.version(n)`** dans `db.ts` avec une `.upgrade()` — jamais modifier un store existant sans bump de version (sinon corruption/incohérence côté utilisateurs). Idem côté serveur : toute nouvelle collection doit être ajoutée à `Collection`/`EMPTY` dans `syncStore.ts` **et** à `COLLECTIONS` dans `index.ts` **et** au payload push/pull dans `sync.ts` (web) — les trois doivent rester synchronisés.
9. Ne pas changer le **contrat des endpoints** (`/api/v1/notes/ingest`, `/api/v1/sync/push|pull`, `/mcp`, `/api/v1/tokens`) sans mettre à jour le connecteur ET l'extension ET le web ET `apps/mcp`.
10. Toute entité soft-deletable (`notes`, `tags`, `folders`, `canvases`) doit filtrer `deletedAt` dans **toutes** ses requêtes de lecture côté client (Dexie) — un oubli fait réapparaître des éléments supprimés après sync.

**Déploiement :**
11. Le déploiement se fait **uniquement** via `deploy.sh` (token en `.env`, push, puis révocation du token GitHub).
12. `deploy.sh` fait un **force push** : vérifier qu'on est sur la bonne branche (`main`) et que le travail local est bien celui voulu (`git status`, `git log`) avant de lancer.
13. Après déploiement : **surveiller le build Railway** (logs). En cas d'échec, ne pas empiler les push — corriger, rebuild local, puis redéployer.
14. Prévoir un **rollback** : noter le dernier commit stable (`git log`) ; en cas de régression, `git revert` ou redeploy du commit précédent.
15. Rappel volume : si `DATA_DIR` n'est **pas** réglé sur le mount path du volume Railway, `store.json`/`tokens.json` sont réinitialisés à chaque déploiement (clés de synchro et tokens à régénérer).
16. **Revue avant déploiement** : si une revue par workflow (agents) est utilisée pour vérifier un diff, s'assurer qu'elle s'est **réellement exécutée** (pas d'échecs massifs type « limite de session ») avant de faire confiance à un verdict « aucun problème » — sinon repasser en revue manuelle ciblée sur les fichiers modifiés.

---

## 12. Fichiers à connaître

| Rôle | Fichier |
|---|---|
| Moteur de parsing (TS) | `packages/core/src/parser.ts`, `packages/core/src/types.ts` |
| Moteur d'enrichissement (Python) | `apps/enrichment-py/auranote_enrich/{text,analyze,pipeline}.py` |
| Schéma & CRUD données (Dexie) | `apps/web/src/db/db.ts` |
| Moteur de synchronisation (client) | `apps/web/src/lib/sync.ts`, `apps/web/src/lib/syncBus.ts` |
| Store de synchronisation (serveur) | `apps/server/src/syncStore.ts` |
| Ingestion (connecteur/extension) | `apps/server/src/ingest.ts` |
| Connecteur MCP (outils) | `apps/server/src/mcp.ts` |
| API + auth | `apps/server/src/index.ts` |
| Tokens / clés de synchro | `apps/server/src/tokens.ts` |
| Layout + navigation + arborescence | `apps/web/src/components/Layout.tsx`, `apps/web/src/components/FolderTree.tsx` |
| Éditeur | `apps/web/src/components/Editor.tsx` |
| Canvas (page + nœuds + moteur) | `apps/web/src/pages/CanvasPage.tsx`, `apps/web/src/canvas/{nodes.tsx,engine.ts}` |
| Réglages (thème, sync, tokens/connecteur) | `apps/web/src/pages/SettingsPage.tsx` |
| Icônes | `apps/web/src/components/icons.tsx` |
