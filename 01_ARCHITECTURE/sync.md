# 01_ARCHITECTURE — Architecture Synchronisation Fichier Local (`Monidée.md`)

---

## 🔄 Vue d'Ensemble Synchronisation

AuraNote AI Studio offre une intégration directe avec le fichier physique `Monidée.md` présent sur l'ordinateur de l'utilisateur, garantissant une conservation pérenne et interopérable avec n'importe quel éditeur Markdown.

---

## 🛠️ Spécifications de la File System Access API

1. **Obtention des Permissions :**
   - L'utilisateur sélectionne le fichier `Monidée.md` via `window.showOpenFilePicker()`.
   - L'application sauvegarde le `FileSystemFileHandle` dans IndexedDB.
2. **Stratégie de Synchronisation (Append / Merge) :**
   - Chaque nouvelle note validée est formatée selon le modèle Markdown standardisé d'AuraNote et ajoutée (append) en fin de fichier `Monidée.md`.
   - Modèle de bloc note concaténé :
     ```markdown
     ---
     id: UUID
     title: "Titre de la note"
     aura: "Stratégie & Décisions"
     date: "2026-07-23T13:15:00Z"
     ---

     # Titre de la note

     Contenu de la note en Markdown...

     ---
     ```

3. **Fallback en cas d'absence d'accès direct [CONCEPTION] :**
   - Si la File System Access API n'est pas supportée par le navigateur (ex: iOS Safari), l'application propose un téléchargement direct du fichier `.md` mis à jour ou le passage via le presse-papier.
