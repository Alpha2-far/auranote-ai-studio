# 00_PROJECT — Décomposition Fonctionnelle & Structurelle

---

## 🌳 Arborescence Hiérarchique du Projet

Projet : **AuraNote AI Studio**

---

### Domaines, Modules, Fonctionnalités et Tâches

```
AuraNote AI Studio
├── Domaines : Données & Stockage (Core Data Domain)
│   └── Module : Storage Engine
│       ├── Fonctionnalité : Modélisation des Notes & Auras
│       │   └── Tâche : TASK-001 (Data Models & Storage Infrastructure)
│       └── Fonctionnalité : Sync Fichier Local (Monidée.md)
│           └── Tâche : TASK-002 (Local File Sync Engine)
│
├── Domaines : Ingestion & Capture (Capture Domain)
│   └── Module : Fast Ingestion Engine
│       ├── Fonctionnalité : Coller Intelligent (Smart Paste)
│       │   └── Tâche : TASK-003 (Smart Paste & Text Cleaner Engine)
│       ├── Fonctionnalité : Bouton / Extension Navigateur PC
│       │   └── Tâche : TASK-004 (Web Extension PC 1-Click Capture)
│       ├── Fonctionnalité : Cible de Partage Mobile (Share Target PWA)
│       │   └── Tâche : TASK-005 (Mobile Share Target & PWA)
│       └── Fonctionnalité : Ordre direct à l'IA (AI Command API)
│           └── Tâche : TASK-006 (AI Assistant Command Integration)
│
└── Domaines : Interface Utilisateur & Export (UI & Export Domain)
    └── Module : Aura Experience Engine
        ├── Fonctionnalité : Consultation & Édition Zen (Reader & Editor)
        │   └── Tâche : TASK-007 (Distraction-Free Note Reader & Editor)
        └── Fonctionnalité : Recherche, Filtres Auras & Exports (MD/PDF)
            └── Tâche : TASK-008 (Search, Aura Filtering & Export Engine)
```

---

## 📋 Matrice d'Indépendance des Tâches

| ID Tâche | Nom de la Tâche | Dépendances Amont | Responsabilité Fonctionnelle Unique |
| :--- | :--- | :--- | :--- |
| **TASK-001** | Data Models & Storage Infrastructure | Aucune | Gérer le stockage local IndexedDB et la structure de données des notes. |
| **TASK-002** | Local File Sync Engine | TASK-001 | Synchroniser le store local avec le fichier physique `Monidée.md`. |
| **TASK-003** | Smart Paste & Text Cleaner Engine | TASK-001 | Nettoyer le texte du presse-papier et générer le titre et le tag Aura. |
| **TASK-004** | Web Extension PC 1-Click Capture | TASK-003 | Capturer le contenu sur PC depuis Gemini/Claude/ChatGPT et l'envoyer au store. |
| **TASK-005** | Mobile Share Target & PWA | TASK-003 | Intercepter les partages mobiles Android/iOS vers l'application. |
| **TASK-006** | AI Assistant Command Integration | TASK-001 | Fournir un point d'entrée API/Webhook pour la création automatique de note. |
| **TASK-007** | Distraction-Free Note Reader & Editor | TASK-001 | Offrir l'UI épurée de lecture et d'édition des notes. |
| **TASK-008** | Search, Aura Filtering & Export Engine | TASK-007 | Offrir la recherche instantanée, le filtrage par Auras et l'export MD/PDF. |
