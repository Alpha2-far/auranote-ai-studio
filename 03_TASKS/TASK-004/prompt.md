# TASK-004 : Autonomous Execution Prompt

---

## 🎯 Contexte & Objectif
Tu es un ingénieur expert en extensions navigateur. Ta mission est de développer l'extension Chrome Manifest V3 dans le dossier `extension/` pour capturer du texte en 1-clic depuis Gemini, Claude ou ChatGPT.

---

## 📂 Fichiers Concernés
- `extension/manifest.json`
- `extension/background.js`
- `extension/content.js`
- `extension/popup/popup.html`
- `extension/popup/popup.js`

---

## 🔒 Contraintes & Règles
1. Utilise Manifest V3.
2. Ajoute un item de menu contextuel "Envoyer vers AuraNote".
3. Transmets le contenu de manière sécurisée.

---

## ✅ Critères d'Acceptation
- Extension chargeable en mode développeur.
- Capture et envoi réussis vers l'application.

---

## ⛔ Interdictions
- N'utilise pas d'APIs obsolètes Manifest V2.

---

Lorsque cette tâche est terminée, arrête-toi immédiatement. N'essaie jamais de commencer une autre tâche.
