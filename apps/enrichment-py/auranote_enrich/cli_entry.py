"""Point d'entrée CLI (utilisé par `auranote-enrich`, `python3 -m auranote_enrich`, et cli.py)."""
from __future__ import annotations

import argparse
import json
import os
import sys
from typing import List, Optional

from .pipeline import enrich


def _read_input(arg: Optional[str]) -> str:
    if not arg:
        return sys.stdin.read()
    if os.path.isfile(arg):
        with open(arg, "r", encoding="utf-8") as f:
            return f.read()
    return arg


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Enrichissement local AuraNote (aucune IA externe).")
    parser.add_argument("input", nargs="?", help="Fichier, texte brut, ou stdin si absent.")
    parser.add_argument("--title", help="Titre explicite (sinon extrait).")
    parser.add_argument("--json", action="store_true", help="Sortie JSON complète.")
    parser.add_argument("--summary", action="store_true", help="Afficher uniquement le résumé.")
    parser.add_argument("--keywords", action="store_true", help="Afficher uniquement les mots-clés.")
    args = parser.parse_args(argv)

    raw = _read_input(args.input)
    if not raw.strip():
        print("Erreur : aucun contenu à traiter.", file=sys.stderr)
        return 1

    result = enrich(raw, title=args.title)

    if args.summary:
        print(result["summary"])
    elif args.keywords:
        print(", ".join(result["keywords"]))
    elif args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(result["markdown"])
    return 0
