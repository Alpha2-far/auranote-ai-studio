# @auranote/enrichment-py — Moteur d'enrichissement local

Traitement **100 % local, déterministe, sans aucune IA externe** ni dépendance
(Python **stdlib uniquement**). Confidentialité, coût nul, hors-ligne.

## Fonctions

- **Nettoyage** des scories d'UI (Gemini/Claude/ChatGPT).
- **Segmentation** en sections numérotées + encadrés (intuition, clarification, …).
- **Mots-clés** par fréquence (mots vides FR/EN filtrés).
- **Résumé extractif** (phrases les mieux notées par densité de mots-clés).
- **Classification** par « Aura » + **tags suggérés**.

## CLI

```bash
cd apps/enrichment-py

# Markdown propre (défaut)
python3 cli.py note.md

# Objet JSON complet (titre, sections, mots-clés, résumé, aura, tags)
echo "Texte…" | python3 cli.py --json

python3 cli.py note.md --summary     # résumé seul
python3 cli.py note.md --keywords    # mots-clés seuls
```

## Tests

```bash
cd apps/enrichment-py
python3 -m unittest discover -s tests -v
```

## En bibliothèque

```python
from auranote_enrich import enrich
data = enrich("ChatGPT a dit :\n1. Idée\nL'intuition clé : ...")
# → { title, cleaned, markdown, sections, keywords, summary, suggestedAura, suggestedTags }
```

## Intégration (optionnelle)

Le serveur Node (`apps/server`) peut appeler ce moteur en local via `child_process`
lorsqu'une variable d'env l'active (ex. `ENRICH_CMD="python3 apps/enrichment-py/cli.py --json"`).
Par défaut, le serveur reste sans dépendance Python — l'enrichissement est **opt-in**.
Aucun appel réseau vers un fournisseur d'IA n'est effectué, jamais.
