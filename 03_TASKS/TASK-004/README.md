# TASK-004 : Extension Navigateur PC (1-Clic PC)

---

## 📌 1. Le Problème
Sur ordinateur, passer d'une fenêtre de discussion avec Gemini/Claude/ChatGPT à l'application AuraNote pour faire un copier-coller peut introduire de la friction cognitive.

---

## 🎯 2. L'Objectif
Développer une extension navigateur Manifest V3 (Chrome/Firefox/Edge) qui ajoute un bouton de capture rapide ou un raccourci clavier pour envoyer la dernière réponse affichée directement dans AuraNote.

---

## 🏁 3. Le Résultat Attendu
Une extension fonctionnelle dans le dossier `extension/` capable de capturer le texte sélectionné ou la zone de réponse de l'IA et de l'envoyer au store d'AuraNote.

---

## 🔍 4. Le Périmètre
- Fichier Manifest V3 (`extension/manifest.json`).
- Content Script (`extension/content.js`) détectant les réponses sur `chatgpt.com`, `gemini.google.com`, `claude.ai`.
- Communication par message avec l'application principale.

---

## 🚫 5. Le Hors Périmètre
- Publication sur le Chrome Web Store.
- Modification de l'UI principale d'AuraNote.
