# TASK-006 : Autonomous Execution Prompt

---

## 🎯 Contexte & Objectif
Tu es un ingénieur Backend / DevOps expert Railway. Ta mission est d'implémenter l'API Node.js/Express `server/index.js` et le fichier de configuration Railway (`railway.json`) pour l'ingestion d'ordres IA.

---

## 📂 Fichiers Concernés
- `server/index.js`
- `server/routes/ingest.js`
- `railway.json`
- `Dockerfile`

---

## 🔒 Contraintes & Règles
1. Le service doit pouvoir être déployé en 1 clic sur Railway.
2. Protège l'endpoint via un header `Authorization: Bearer <API_SECRET>`.
3. Valide le format JSON entrant.

---

## ✅ Critères d'Acceptation
- Déploiement Railway fonctionnel.
- Ingestion de notes via `POST /api/v1/notes/ingest`.

---

## ⛔ Interdictions
- N'interfère pas avec l'interface client SPA.

---

Lorsque cette tâche est terminée, arrête-toi immédiatement. N'essaie jamais de commencer une autre tâche.
