# TASK-001 : Contexte Technique & Architecture

---

## 📄 Contexte
AuraNote AI Studio est un carnet "Local-First". L'expérience utilisateur repose sur la rapidité absolue de la prise de note et la persistance hors-ligne. IndexedDB est le choix d'architecture retenu pour gérer les notes localement.

---

## 🏛️ Architecture Concernée
- `01_ARCHITECTURE/database.md` [SOURCE]
- `01_ARCHITECTURE/general.md` [SOURCE]

---

## 🛠️ Décisions Déjà Prises
- **Format Identifiant :** UUID v4 pour chaque note.
- **Auras Thématiques :** Stratégie & Décisions, Actions & Objectifs, Technique & Architecture, Workflows & Processus, Inspirations & Idées brutes.
- **Stockage Navigateur :** IndexedDB natif ou via wrapper léger.

---

## 🔗 Dépendances
- Tâches préalables : Aucune (Première tâche du projet).
- Tâches suivantes : `TASK-002`, `TASK-003`, `TASK-006`, `TASK-007`.
