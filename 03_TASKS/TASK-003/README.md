# TASK-003 : Moteur de "Coller Intelligent" (Smart Paste)

---

## 📌 1. Le Problème
Lorsqu'un utilisateur copie du texte depuis un chat d'IA (Gemini, Claude, ChatGPT), le texte contient souvent du formattage parasite, des boutons "Copy", des balises superflues, et manque d'un titre structuré et d'une catégorie.

---

## 🎯 2. L'Objectif
Créer le service `SmartPasteService.js` capable de lire le presse-papier, nettoyer automatiquement la mise en page, extraire ou générer un titre pertinent, et catégoriser la note dans l'une des 5 Auras thématiques.

---

## 🏁 3. Le Résultat Attendu
Une fonction pure et rapide `SmartPasteService.processClipboard(rawText)` retournant un objet Note valide prêt à être sauvegardé dans le stockage.

---

## 🔍 4. Le Périmètre
- Lecture sécurisée du presse-papier système (`navigator.clipboard.readText()`).
- Nettoyage regex et heuristique du Markdown/HTML copié.
- Générateur automatique de titre.
- Classification heuristique par mot-clé vers une Aura (Stratégie, Actions, Technique, Workflows, Inspirations).

---

## 🚫 5. Le Hors Périmètre
- L'extension web Chrome (traité dans `TASK-004`).
- Le bouton UI final de l'interface (traité dans `TASK-007`).
