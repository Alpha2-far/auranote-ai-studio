# 01_ARCHITECTURE — Architecture Générale du Système

---

## 🏛️ Vue d'Ensemble de l'Architecture

AuraNote AI Studio repose sur une **architecture Local-First & Hybrid Ingestion**, optimisée pour une expérience sans friction, une réactivité instantanée et une souveraineté totale des données utilisateur.

```
+-----------------------------------------------------------------------------------+
|                                 SOURCES D'ENTRÉE                                  |
|  +------------------+  +-------------------+  +-----------------+  +------------+ |
|  | Smart Paste UI   |  | Web Extension PC  |  | Mobile Share    |  | AI Webhook | |
|  | (Presse-papier)  |  | (Chrome MV3)      |  | (PWA Target)    |  | API        | |
|  +--------+---------+  +---------+---------+  +--------+--------+  +-----+------+ |
+-----------|----------------------|-------------------|-------------------|--------+
            |                      |                   |                   |
            +----------------------+---------+---------+-------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------+
|                               AURA NOTE CORE SYSTEM                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           INGESTION & CLEANING LAYER                        |  |
|  |  - Auto-titrage & Markdown Formatter                                        |  |
|  |  - Aura Categorizer Engine                                                  |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  |                             STORAGE & SYNC LAYER                            |  |
|  |  - IndexedDB Store (Client State)                                           |  |
|  |  - File System Access API Controller (Sync Monidée.md)                        |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  |                          UI & CONSULTATION LAYER                            |  |
|  |  - Zen Reader & Editor Component                                            |  |
|  |  - Search & Aura Filter Subsystem                                           |  |
|  |  - Export Engine (Markdown & PDF)                                           |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 🧩 Principes Directeurs d'Architecture

1. **Local-First & Resilience [CONCEPTION] :** L'application fonctionne entièrement sans serveur central obligatoire. Les données de l'utilisateur sont conservées sur son navigateur / terminal et synchronisées avec son fichier local `Monidée.md`.
2. **Modularité Stricte [CONCEPTION] :** Les modules d'ingestion (Paste, Extension, Mobile Target, AI API) sont indépendants du moteur de restitution et d'édition.
3. **Zéro Latence [CONCEPTION] :** Rendu instantané (< 50ms) en s'appuyant sur des technologies légères et modernes.

---

## 🛡️ Justification des Choix Techniques

- **PWA (Progressive Web App) + Web Share Target :** Permet une expérience mobile native sans lourdeur d'installation via App Store.
- **File System Access API :** Fournit l'accès natif sécurisé au fichier système `Monidée.md`.
- **IndexedDB via Dexie.js (ou API native) :** Offre un stockage structuré et requêtable localement.
