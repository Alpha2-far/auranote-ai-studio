# TASK-003 : Critères d'Acceptation

---

## 📋 Checklist de Validation

- [x] L'extraction depuis le presse-papier fonctionne de manière asynchrone sans bloquer l'UI.
- [x] Les scories typiques de copier-coller (en-têtes "Gemini", boutons "Copy Code") sont purgées.
- [x] Le titre est extrait de la première balise `#` ou déduit des 60 premiers caractères.
- [x] L'Aura est assignée correctement selon les mots-clés du texte.
- [x] Le contenu est nettoyé contre toute injection XSS malveillante.
