# 01_ARCHITECTURE — Architecture Intégration IA & Traitement de Texte

---

## 🤖 Vue d'Ensemble Intégration IA

AuraNote AI Studio interagit avec les assistants IA selon deux modes :
1. **Traitement Passif (Coller / Ingestion) :** Nettoyage heuristique et extraction de titre à partir du texte brut collé ou partagé depuis Gemini, Claude ou ChatGPT.
2. **Traitement Actif (Ordre à l'IA) :** Réception de commandes structurées émises par l'assistant IA vers l'application.

---

## 🧠 Algorithme d'Auto-Titrage et de Nettoyage Markdown (Smart Paste)

```
[Texte Brut Copié]
       │
       ▼
1. Nettoyage des scories d'UI (ex: "Copy", "Généré par Gemini", wrappers HTML superflus)
       │
       ▼
2. Détection du Titre :
   - Si 1ère ligne commence par `#` ou `##` -> Extrait comme Titre.
   - Sinon -> Prend la première phrase complète (max 60 caractères).
       │
       ▼
3. Classification par Aura (Heuristique par mots-clés) :
   - Contient ("décision", "choix", "stratégie") -> 'Stratégie & Décisions'
   - Contient ("todo", "action", "objectif", "étape") -> 'Actions & Objectifs'
   - Contient ("code", "api", "architecture", "db") -> 'Technique & Architecture'
   - Contient ("process", "workflow", "étape", "pipeline") -> 'Workflows & Processus'
   - Defaut -> 'Inspirations & Idées brutes'
       │
       ▼
[Note Structurée Prête à Enregistrer]
```

---

## 🛰️ Protocole d'Ordre à l'IA (AI Command Protocol)

- **Prompt Système Recommandé pour l'Utilisateur :**
  > "Lorsque je te demande d'archiver notre échange, génère un bloc JSON au format AuraNote et appelle le Webhook local AuraNote."
