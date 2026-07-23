# 01_ARCHITECTURE — Structure des Dossiers du Code Applicatif

---

## 📁 Organisation du Code Source Applicatif

```
auranote-app/
├── index.html
├── manifest.webmanifest
├── sw.js (Service Worker PWA & Share Target)
├── css/
│   ├── main.css (Design tokens, reset, typography)
│   ├── auras.css (Thématisation des Auras)
│   └── zen-editor.css (Styles du lecteur / éditeur épuré)
├── js/
│   ├── app.js (Point d'entrée principal SPA)
│   ├── config.js (Configuration & Constants)
│   ├── models/
│   │   └── Note.js (Définition du modèle et validation)
│   ├── services/
│   │   ├── StorageService.js (Interface IndexedDB)
│   │   ├── LocalFileSyncService.js (File System Access API - Monidée.md)
│   │   ├── SmartPasteService.js (Nettoyage & Titrage)
│   │   └── ExportService.js (Générateur Markdown & PDF)
│   ├── components/
│   │   ├── HeaderComponent.js
│   │   ├── SmartPasteButtonComponent.js
│   │   ├── AuraFilterBarComponent.js
│   │   ├── NoteListComponent.js
│   │   └── ZenReaderEditorComponent.js
│   └── utils/
│       ├── sanitizer.js (XSS Prevention)
│       └── helpers.js
├── extension/ (Extension Chrome Manifest V3)
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup/
│       ├── popup.html
│       └── popup.js
└── assets/
    ├── icons/
    └── favicon/
```
