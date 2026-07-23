# TASK-003 : Autonomous Execution Prompt

---

## 🎯 Contexte & Objectif
Tu es un ingénieur expert en parsing et traitement de texte. Ta mission est d'implémenter `SmartPasteService.js` et `sanitizer.js` pour nettoyer le texte copié depuis les IA, en extraire un titre et lui assigner une Aura thématique.

---

## 📂 Fichiers Concernés
- `js/services/SmartPasteService.js`
- `js/utils/sanitizer.js`

---

## 🔒 Contraintes & Règles
1. Traite la lecture de la presse-papier via `navigator.clipboard.readText()`.
2. Assure-toi que les 5 Auras sont correctement dérivées selon le contenu.
3. Purge tout script XSS potentiel.

---

## ✅ Critères d'Acceptation
- Nettoyage du formattage parasite des réponses IA.
- Génération d'une instance `Note` prête à enregistrer.

---

## ⛔ Interdictions
- N'interfère pas avec le code de synchronisation `Monidée.md`.

---

Lorsque cette tâche est terminée, arrête-toi immédiatement. N'essaie jamais de commencer une autre tâche.
