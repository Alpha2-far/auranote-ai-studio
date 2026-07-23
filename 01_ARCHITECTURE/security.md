# 01_ARCHITECTURE — Architecture Sécurité & Protection des Données

---

## 🔒 Principes de Sécurité

1. **Confidentialité Totale (Zero Telemetry) [CONCEPTION] :** Aucune note, réflexion ou métadonnée n'est transmise à un serveur tiers non contrôlé par l'utilisateur.
2. **Assainissement du Contenu (DOMSanitize & XSS Prevention) [CONCEPTION] :** Le contenu Markdown issu du presse-papier ou d'API externes est systématiquement assaini avant d'être rendu dans l'UI via `DOMPurify` ou équivalent.
3. **Isolation des Origines (CORS & Extension Sandbox) [CONCEPTION] :** L'extension web fonctionne sous les contraintes strictes de Manifest V3, interdisant l'exécution de code à distance (`unsafe-eval`).
4. **Permissions Fichiers Restreintes :** La File System Access API demande une confirmation explicite à l'utilisateur avant d'écrire dans `Monidée.md`.
