# 01_ARCHITECTURE — Conventions de Nommage & Bonnes Pratiques

---

## 🔤 Règles de Nommage

1. **Fichiers JavaScript / Modules :** `PascalCase` pour les classes et composants (`ZenReaderEditorComponent.js`), `camelCase` pour les modules utilitaires (`sanitizer.js`).
2. **Variables & Fonctions :** `camelCase` (`createNote`, `isSyncedWithFile`).
3. **Constantes Globale :** `UPPER_SNAKE_CASE` (`DEFAULT_AURA_TYPE`, `MAX_TITLE_LENGTH`).
4. **Fichiers CSS / Classes CSS :** `kebab-case` (`.aura-badge-strategy`, `.zen-editor-container`).
5. **Identifiants Unique (IDs HTML) :** `kebab-case` descriptif (`id="smart-paste-btn"`, `id="search-input"`).
6. **Commits Git :** Format Conventional Commits (`feat(capture): add smart paste title generator`, `fix(sync): resolve file handle permission renewal`).
