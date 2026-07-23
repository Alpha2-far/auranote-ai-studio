# TASK-005 : Cible de Partage Mobile (Share Target PWA)

---

## 📌 1. Le Problème
Sur smartphone (Android/iOS), envoyer une réflexion issue de l'application mobile Gemini/Claude/ChatGPT vers son carnet doit se faire via le menu natif "Partager" sans copier-coller manuel.

---

## 🎯 2. L'Objectif
Configurer le Web App Manifest (`manifest.webmanifest`) et le Service Worker (`sw.js`) d'AuraNote pour qu'elle apparaisse dans le menu natif de partage du système d'exploitation mobile.

---

## 🏁 3. Le Résultat Attendu
Une PWA capable d'intercepter les requêtes HTTP GET/POST émises lors d'un partage système vers la route `/share-target` et d'invoquer `SmartPasteService`.

---

## 🔍 4. Le Périmètre
- Configuration du champ `share_target` dans `manifest.webmanifest`.
- Interception de la route `/share-target` dans `sw.js`.
- Redirection automatique vers la note créée.

---

## 🚫 5. Le Hors Périmètre
- Publication d'une application native Android APK / iOS IPA.
