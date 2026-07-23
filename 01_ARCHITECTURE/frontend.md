# 01_ARCHITECTURE — Architecture Frontend

---

## 🎨 Vue d'Ensemble Frontend

L'interface utilisateur d'AuraNote AI Studio est conçue selon un modèle **Zen & Focus First**, assurant une lisibilité maximale, un rendu typographique soigné et une réactivité instantanée.

---

## 🛠️ Stack & Composants Frontend

1. **Framework & Rendu UI [CONCEPTION] :** Single Page Application (SPA) / Progressive Web App (PWA) construite avec HTML5 / JavaScript (ESNext) / Vanilla CSS (Design Tokens & CSS Variables).
2. **Design System & Esthétique [CONCEPTION] :**
   - **Thématique Auras :** Palettes visuelles distinctes pour chaque Aura (Stratégie, Actions, Technique, Workflows, Inspirations).
   - **Typographie :** Caractères modernes optimisés pour la lecture longue (ex: Inter / System UI Font stack).
   - **Transitions :** Animations fluides et subtiles pour les changements de filtres et l'ouverture des notes.

---

## 📦 Structure des Composants UI

```
App
├── HeaderComponent (Titre, Statut Sync Monidée.md, Boutons Action)
├── CaptureBarComponent
│   ├── SmartPasteButton
│   └── QuickNewNoteButton
├── AuraFilterBarComponent (Pills de filtres par Auras & Barre de recherche)
├── MainContentLayout
│   ├── NoteListSidebar / GridView (Vue liste / cartouche par Auras)
│   └── ZenReaderEditorComponent
│       ├── NoteHeader (Titre, Aura Badge, Date, Raccourcis)
│       ├── MarkdownRenderer (Rendu HTML propre et épuré)
│       └── EditorToolbar (Actions : Exporter MD, Exporter PDF, Supprimer)
└── SystemStatusBar (Statut de synchronisation & Notifications Toast)
```

---

## ⚡ Stratégie de Performance

- Rendu côté client (Client-Side Rendering) avec pré-filtrage en mémoire.
- Découpage en modules ES pour chargement instantané.
- Zéro framework lourd encombrant le bundle initial.
