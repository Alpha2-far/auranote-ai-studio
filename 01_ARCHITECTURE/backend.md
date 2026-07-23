# 01_ARCHITECTURE — Architecture Backend & Service API

---

## ⚙️ Vue d'Ensemble Backend

Conformément au modèle Local-First, AuraNote AI Studio privilégie l'exécution locale. Le module backend se résume à une couche de services légers (Edge / Micro-service ou Service Worker local) dédiée à l'ingestion par Webhook et à la gestion de la capture directe.

---

## 🔌 Modules Backend / API Services

1. **Ingestion Webhook / AI Command API [CONCEPTION] :**
   - Endpoint HTTP `POST /api/v1/notes/ingest`
   - Permet à des assistants IA tierces (Custom GPT, Gemini Gems, scripts CLI) de poster directement des données de note au format JSON.
   - Format de payload :
     ```json
     {
       "title": "Titre suggéré ou optionnel",
       "content": "Contenu Markdown de la note",
       "aura": "Stratégie & Décisions",
       "source": "Gemini-Assistant",
       "secret_token": "token_optionnel_securite"
     }
     ```

2. **Web Extension Receiver Service [CONCEPTION] :**
   - Canaux de communication inter-processus via `window.postMessage` ou Messaging API de l'Extension Web Chrome.

3. **Fallback Export Server / Local Engine [CONCEPTION] :**
   - Génération de fichiers PDF côté client via `window.print()` optimisé avec feuilles de style CSS Paged Media `@media print`, éliminant le besoin d'un serveur tiers de rendu PDF.
