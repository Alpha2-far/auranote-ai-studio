# 00_PROJECT — Overview & Phase 0 Analysis

---

## 🎯 1. Résumé du Projet

**AuraNote AI Studio** est un carnet de réflexions intelligent conçu comme un "second cerveau" personnel. Il vise à centraliser, structurer et pérenniser toutes les idées, décisions stratégiques, choix d'architecture et réflexions issues des interactions avec les assistants IA (Gemini, Claude, ChatGPT).

---

## 🏆 2. Objectifs Globaux

- **Zéro perte [SOURCE] :** Transformer le flux éphémère de conversations avec les IA en notes structurées et durables.
- **Zéro friction [SOURCE] :** Permettre la capture d'une idée ou d'une réponse IA en 1 clic ou 1 geste (Coller intelligent, Share Target mobile, Extension web, Ordre direct à l'IA).
- **Clarté mentale [SOURCE] :** Fournir une interface de consultation et de rédaction épurée, fluide et agréable, libre de toute distraction.
- **Souveraineté des données [SYNTHESIS] :** Assurer la synchronisation locale avec un fichier central `Monidée.md` et proposer des exports Markdown / PDF.

---

## 👥 3. Utilisateurs Cibles

- **Profil principal :** Professionnels, développeurs, ingénieurs et créateurs travaillant quotidiennement avec plusieurs assistants IA (Gemini, Claude, ChatGPT, etc.) et cherchant à capitaliser sur leurs échanges.

---

## ⚡ 4. Contraintes Techniques et Qualités

- **Performances [CONCEPTION] :** Temps de capture et de recherche < 100ms.
- **Support Multi-Plateformes [SOURCE/CONCEPTION] :** Desktop (Web application / PWA + Extension Navigateur) et Mobile (Web application / PWA avec support Web Share Target).
- **Format des données [SOURCE] :** Format Markdown natif pour la portabilité des notes et compatibilité `Monidée.md`.
- **Zéro Dépendance Serveur Lourd [CONCEPTION] :** Stockage local-first (IndexedDB / File System Access API).

---

## ⚠️ 5. Risques Identifiés

- **Risque 1 (Accès Fichier Local) [CONCEPTION] :** Restdictions de la File System Access API selon les navigateurs web. *Mitigation :* Fallback automatique sur IndexedDB / téléchargement de fichier `.md`.
- **Risque 2 (Partage Mobile PWA) [CONCEPTION] :** Compatibilité limitée de Web Share Target sur iOS Safari par rapport à Android Chrome. *Mitigation :* Fournir un bouton "Coller intelligent" proéminent et fallback clipboard.
- **Risque 3 (Intégration Ordres IA) [UNKNOWN] :** Manque de standard uni des webhooks d'action sur assistants propriétaires. *Mitigation :* Définir une API REST / Webhook standardisée pouvant être appelés par Custom GPTs ou scripts Webhook.

---

## 💡 6. Hypothèses et Confiance (Engineering of Trust)

| Décision / Élément | Classification | Description & Rationale |
| :--- | :--- | :--- |
| Concept AuraNote AI Studio | **[SOURCE]** | Issu directement du cahier des charges. |
| Catégories Auras (5 thématiques) | **[SOURCE]** | Stratégie, Actions, Technique, Workflows, Inspirations. |
| Sync `Monidée.md` | **[SOURCE]** | Exigence explicite de synchronisation avec le fichier local. |
| PWA / Web Share Target | **[CONCEPTION]** | Choix d'architecture pour le partage sans soumettre d'app native Store. |
| API Webhook pour Ordre IA | **[UNKNOWN]** | Modalité exacte de déclenchement à préciser selon l'assistant hôte. |

---

## ❓ 7. Questions Ouvertes

1. Le fichier `Monidée.md` doit-il enregistrer toutes les notes concaténées ou une note par fichier Markdown dans un dossier ? *Hypothèse retenue : Fichier central concaténé + option export unitaire.*
