# TASK-002 : Moteur de Synchronisation Fichier Local (`Monidée.md`)

---

## 📌 1. Le Problème
L'utilisateur veut s'assurer que ses réflexions conservées dans AuraNote AI Studio sont également synchronisées avec un fichier Markdown local sur son ordinateur (`Monidée.md`), garantissant une conservation pérenne et la souveraineté totale de ses données.

---

## 🎯 2. L'Objectif
Développer le service `LocalFileSyncService.js` s'appuyant sur la File System Access API du navigateur afin d'écrire et mettre à jour automatiquement les notes dans le fichier local `Monidée.md`.

---

## 🏁 3. Le Résultat Attendu
Un service capable d'ajouter de nouvelles notes sous forme de blocs Markdown structurés avec métadonnées YAML Frontmatter au fichier `Monidée.md` sans corrompre le contenu existant.

---

## 🔍 4. Le Périmètre
- Demande d'accès au fichier `Monidée.md` via `showOpenFilePicker()`.
- Persistance du handle de fichier dans le stockage local.
- Concaténation formatée des notes en Markdown standard.
- Gestion élégante des erreurs et mode fallback si l'accès direct est refusé.

---

## 🚫 5. Le Hors Périmètre
- La capture depuis le presse-papier ou l'extension web (traité dans `TASK-003` et `TASK-004`).
- L'interface d'édition WYSIWYG (traité dans `TASK-007`).
