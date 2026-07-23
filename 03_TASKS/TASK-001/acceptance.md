# TASK-001 : Critères d'Acceptation

---

## 📋 Checklist de Validation

- [x] Le schéma IndexedDB `AuraNoteDB` s'initialise sans erreur dans le navigateur.
- [x] Le modèle `Note` valide la présence des champs obligatoires : `id`, `title`, `content`, `aura`, `createdAt`.
- [x] La méthode `StorageService.addNote(noteData)` enregistre correctement la note dans IndexedDB.
- [x] La méthode `StorageService.getAllNotes()` retourne la liste complète des notes triées par date de création décroissante.
- [x] La méthode `StorageService.getNotesByAura(aura)` filtre avec succès les notes selon la thématique Aura spécifiée.
- [x] La méthode `StorageService.deleteNote(id)` supprime la note spécifiée de la base IndexedDB.
- [x] Les opérations asynchrones s'exécutent en moins de 10ms.
