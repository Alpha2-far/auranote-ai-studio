# TASK-006 : Intégration des Ordres à l'IA (AI Command API)

---

## 📌 1. Le Problème
L'utilisateur souhaite pouvoir donner une instruction verbale ou écrite directement à son assistant IA (ex: *"Résume nos choix d'aujourd'hui et mets-les dans mon carnet"*) sans avoir à faire un copier-coller manuel.

---

## 🎯 2. L'Objectif
Mettre en place un récepteur de requêtes HTTP / Webhook local ou message handler permettant d'écouter les commandes d'archivage envoyées par des agents IA autonomes ou des Custom GPTs.

---

## 🏁 3. Le Résultat Attendu
Un endpoint de réception capable de valider le payload JSON transmis par l'assistant IA, d'instancier une note avec l'Aura correspondante et de la sauvegarder dans le stockage.

---

## 🔍 4. Le Périmètre
- Handler d'ingestion API HTTP local ou Message Receiver.
- Spécification OpenAPI / JSON Schema du payload.
- Documentation du prompt système à donner aux assistants IA.

---

## 🚫 5. Le Hors Périmètre
- Le développement d'un serveur Cloud payant.
