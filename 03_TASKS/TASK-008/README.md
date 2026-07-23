# TASK-008 : Recherche, Filtres Rápidet et Moteur d'Export (Markdown / PDF)

---

## 📌 1. Le Problème
L'utilisateur accumule de nombreuses réflexions. Il doit pouvoir retrouver une note ou une décision spécifique en quelques secondes grâce à des filtres par Aura et une recherche full-text, puis pouvoir exporter la note en Markdown ou PDF en 1 clic.

---

## 🎯 2. L'Objectif
Implémenter la barre de recherche rapide, le filtrage dynamique par pilules d'Auras (`AuraFilterBarComponent.js`) et le service d'exportation de notes (`ExportService.js`) en format Markdown (`.md`) et PDF (`.pdf`).

---

## 🏁 3. Le Résultat Attendu
Une fonctionnalité de filtrage réactive (< 20ms) et deux boutons d'export unitaire fonctionnels sur la vue de chaque note.

---

## 🔍 4. Le Périmètre
- Composant `AuraFilterBarComponent.js`.
- Algorithme de recherche textuelle rapide dans le store local.
- Service `ExportService.js` (Export au format `.md` et impression/export `.pdf`).

---

## 🚫 5. Le Hors Périmètre
- La synchronisation continue avec `Monidée.md` (traité dans `TASK-002`).
