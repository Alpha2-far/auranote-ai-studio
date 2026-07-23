# TASK-001 : Modèle de données & Infrastructure de Stockage Local

---

## 📌 1. Le Problème
L'application AuraNote AI Studio nécessite une infrastructure de stockage locale fiable, réactive et capable de structurer des notes enrichies (Auras, métadonnées, tags) sans dépendre d'une base de données serveur.

---

## 🎯 2. L'Objectif
Mettre en place la couche de données locale basée sur IndexedDB, créer la structure de données des notes et des paramètres de l'application, et exposer des fonctions CRUD asynchrones ultra-rapides.

---

## 🏁 3. Le Résultat Attendu
Un module `StorageService.js` totalement opérationnel, testable et documenté, capable d'insérer, modifier, supprimer et lire des notes en moins de 10ms.

---

## 🔍 4. Le Périmètre
- Définition de l'interface / modèle Note (titre, contenu, aura, source, tags, dates).
- Initialisation et gestion du schéma IndexedDB (`AuraNoteDB`).
- Service de stockage local (`StorageService.js`).
- Gestion de la persistance locale du paramétrage.

---

## 🚫 5. Le Hors Périmètre
- La synchronisation avec le fichier physique `Monidée.md` (traité dans `TASK-002`).
- L'interface utilisateur de rendu (traité dans `TASK-007`).
