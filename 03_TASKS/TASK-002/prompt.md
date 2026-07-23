# TASK-002 : Autonomous Execution Prompt

---

## 🎯 Contexte & Objectif
Tu es un ingénieur Frontend expert de la File System Access API. Ta mission est d'implémenter le moteur de synchronisation locale `LocalFileSyncService.js` permettant de lire et mettre à jour le fichier `Monidée.md` sur la machine de l'utilisateur.

---

## 📂 Fichiers Concernés
- `js/services/LocalFileSyncService.js`
- `js/services/StorageService.js`

---

## 🔒 Contraintes & Règles
1. Utilise l'API File System Access native (`showOpenFilePicker`, `createWritable`).
2. Format chaque note ajoutée avec un bloc YAML Frontmatter.
3. Gère proprement le rejet des permissions sans crasher l'application.

---

## ✅ Critères d'Acceptation
- Sélection et attachement réussis du fichier `Monidée.md`.
- Écriture asynchrone des notes dans le fichier local sans perte de données.

---

## ⛔ Interdictions
- N'installe pas de bibliothèque lourde Node.js ou FS de serveur.
- Ne touche pas aux interfaces UI dans cette tâche.

---

Lorsque cette tâche est terminée, arrête-toi immédiatement. N'essaie jamais de commencer une autre tâche.
