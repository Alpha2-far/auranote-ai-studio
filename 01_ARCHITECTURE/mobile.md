# 01_ARCHITECTURE — Architecture Mobile & Web Share Target

---

## 📱 Vue d'Ensemble Mobile

Sur mobile (Android / iOS), l'expérience utilisateur doit garantir une capture en **1 seul geste** depuis n'importe quelle application (Gemini, Claude, ChatGPT).

---

## 🚀 Architecture PWA & Web Share Target

1. **Manifest PWA (`manifest.webmanifest`) [CONCEPTION] :**
   ```json
   {
     "name": "AuraNote AI Studio",
     "short_name": "AuraNote",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#0f172a",
     "theme_color": "#0f172a",
     "share_target": {
       "action": "/share-target",
       "method": "GET",
       "params": {
         "title": "title",
         "text": "text",
         "url": "url"
       }
     }
   }
   ```

2. **Service Worker Interceptor [CONCEPTION] :**
   - Le Service Worker de la PWA écoute la route `/share-target`.
   - Il extrait le texte partagé, exécute le module de coller intelligent et redirige l'utilisateur vers la note fraîchement créée.

3. **Fallback UI Mobile [CONCEPTION] :**
   - Bouton flottant de coller rapide (Floating Action Button "Smart Paste") affiché dès l'ouverture de l'application sur écran tactile.
