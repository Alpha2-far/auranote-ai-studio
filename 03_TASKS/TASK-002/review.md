# TASK-002 : Review Checklist

---

## 🔍 Checklist de Revue de Code

- [ ] **Architecture :** Utilisation de la File System Access API selon les normes W3C.
- [ ] **Logique Métier :** Formatage YAML Frontmatter valide sur chaque entrée.
- [ ] **Sécurité :** Vérification systématique des permissions d'écriture (`queryPermission` et `requestPermission`).
- [ ] **Erreurs :** Catch et notification claire si le fichier est verrouillé par un autre processus OS.
