# 01_ARCHITECTURE — Architecture Base de Données & Modèle de Stockage

---

## 🗄️ Vue d'Ensemble Base de Données

Le stockage principal d'AuraNote AI Studio est géré localement via **IndexedDB** pour les requêtes rapides et structurées, doublé d'une persistance sur fichier physique **`Monidée.md`**.

---

## 📋 Schéma des Entités (TypeScript Interfaces)

```typescript
// Enums des Auras Thématiques [SOURCE: Cahier des charges.md]
export type AuraType = 
  | 'Stratégie & Décisions'
  | 'Actions & Objectifs'
  | 'Technique & Architecture'
  | 'Workflows & Processus'
  | 'Inspirations & Idées brutes';

// Interface Principale Note
export interface Note {
  id: string;                  // UUID v4 unique
  title: string;               // Titre auto-généré ou personnalisé
  content: string;             // Contenu brut nettoyé en Markdown
  aura: AuraType;              // Thématique Aura attribuée
  source: string;              // Ex: 'SmartPaste', 'Extension', 'MobileShare', 'AICommand'
  tags: string[];              // Mots-clés extraits
  createdAt: string;           // Datetime ISO 8601
  updatedAt: string;           // Datetime ISO 8601
  isSyncedWithFile: boolean;   // Statut de sync avec Monidée.md
}

// Interface Métadonnées Application
export interface AppSettings {
  monIdeeFilePath?: string;    // Handle du fichier local
  defaultAura: AuraType;       // Aura par défaut lors de la capture
  autoCleanFormatting: boolean;// Flag de nettoyage auto du Markdown
  themeMode: 'dark' | 'light'; // Mode d'affichage UI
}
```

---

## 🔍 Index et Clés de Requête (IndexedDB)

- Primary Key: `id`
- Indexes: `aura`, `createdAt`, `isSyncedWithFile`, `tags` (multi-entry index).
