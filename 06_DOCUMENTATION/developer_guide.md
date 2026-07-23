# 06_DOCUMENTATION — Guide Développeur & Déploiement

---

## 💻 Guide d'Ingénierie pour les Développeurs & Agents IA

### 🛠️ Architecture du Code
L'application est construite selon une architecture Local-First modulaire sans framework lourd.
- Frontend : PWA SPA (Vanilla JS ES6+, HTML5, Vanilla CSS).
- Stockage Local : IndexedDB + File System Access API.
- Extension : Chrome Extension Manifest V3.
- Backend API / Ingestion : Node.js / Express déployé sur Railway.
- **Script d'Assainissement & Mise au Propre Python :** `scripts/clean_and_structure.py`

---

## 🐍 Script Python de Nettoyage et Restructuration (`scripts/clean_and_structure.py`)

Un script Python dédié est mis à disposition pour nettoyer, structurer et mettre au propre vos notes brutes ou votre fichier `Monidée.md` :

### Utilisation CLI :
```bash
# 1. Nettoyer et afficher le Markdown structuré d'un fichier
python3 scripts/clean_and_structure.py "Monidée.md"

# 2. Nettoyer un texte brut ou une réponse IA copiée
python3 scripts/clean_and_structure.py "ChatGPT a dit : # Mon Titre ..."

# 3. Générer un objet JSON prêt pour l'API d'ingestion AuraNote
python3 scripts/clean_and_structure.py --json "Mon texte brut"
```

---

## 🚂 Procédure de Déploiement sur Railway [SOURCE: Directive Utilisateur]

1. **Prérequis :** Un compte Railway (`railway.app`) et la CLI Railway installée.
2. **Initialisation du projet :**
   ```bash
   railway login
   railway init
   ```
3. **Configuration des Variables d'Environnement :**
   - `PORT=3000`
   - `API_SECRET=<votre_jeton_securise>`
4. **Déploiement :**
   ```bash
   railway up
   ```
5. Railway détectera le fichier `railway.json` ou le `Dockerfile` présent à la racine pour déployer le service d'ingestion.
