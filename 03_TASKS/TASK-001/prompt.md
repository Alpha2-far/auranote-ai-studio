# TASK-001 : Autonomous Execution Prompt

---

## 🎯 Contexte & Objectif
Tu es un ingénieur logiciel spécialisé dans le stockage local-first. Ta mission est d'implémenter l'infrastructure de stockage IndexedDB et la structure du modèle de données des notes pour AuraNote AI Studio.

---

## 📂 Fichiers Concernés
- `js/config.js`
- `js/models/Note.js`
- `js/services/StorageService.js`

---

## 🔒 Contraintes & Règles
1. Utilise du JavaScript ES6+ moderne sans framework externe lourd.
2. Respecte scrupuleusement la structure de la note définie dans `01_ARCHITECTURE/database.md`.
3. Assure-toi que toutes les opérations `StorageService` retournent des `Promise`.

---

## ✅ Critères d'Acceptation
- Schéma `AuraNoteDB` correctement initialisé avec les index appropriés.
- Méthodes CRUD (`addNote`, `getAllNotes`, `getNotesByAura`, `deleteNote`) fonctionnelles et testées.

---

## ⛔ Interdictions
- N'écris aucun code d'interface graphique (UI HTML/CSS) dans cette tâche.
- Ne touche pas aux dossiers d'architecture `00_PROJECT` ou `01_ARCHITECTURE`.

---

Lorsque cette tâche est terminée, arrête-toi immédiatement. N'essaie jamais de commencer une autre tâche.
