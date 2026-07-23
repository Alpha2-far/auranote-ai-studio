# 05_REVIEW — Procédure & Grille de Revue du Projet

---

## 🔍 Processus de Revue de Qualité

Chaque tâche développée par un agent spécialisé doit obligatoirement passer par la grille de contrôle à 9 axes avant d'être marquée `Done` dans son fichier `status.md`.

---

## 📋 Grille d'Évaluation à 9 Axes

1. **Architecture :** Respect strict de la séparation des responsabilités et des choix d'architecture Local-First & Railway.
2. **Logique Métier :** Traitement correct des 5 Auras thématiques, de la capture au stockage.
3. **UX (User Experience) :** Zéro friction lors de la capture (1 clic / 1 geste).
4. **UI (User Interface) :** Fidélité au thème "Obsidienne Nuit" (`#0D0F12`, `#E2B872`) et utilisation du logo SVG officiel.
5. **Accessibilité (a11y) :** Rendu sémantique HTML5, navigation au clavier et contraste conforme WCAG AA.
6. **Performance :** Réponse < 50ms sur les interactions locales.
7. **Sécurité :** Sanitation stricte des entrées Markdown/HTML contre les attaques XSS.
8. **Documentation :** Maintien à jour des fichiers `notes.md` et des commentaires de code.
9. **Tests :** Validation systématique de la checklist d'acceptation dans `acceptance.md`.
