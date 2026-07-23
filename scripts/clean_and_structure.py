#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AuraNote AI Studio - Script Python de Nettoyage & Mise au Propre des Notes
========================================================================
Ce script prend en entrée une note brute (texte copié, réponse IA ou fichier Monidée.md),
dépollue les scories d'UI, structure harmonieusement le Markdown et catégorise la note par Aura.
"""

import sys
import re
import json
import argparse
from datetime import datetime

AURA_TYPES = [
    "Stratégie & Décisions",
    "Actions & Objectifs",
    "Technique & Architecture",
    "Workflows & Processus",
    "Inspirations & Idées brutes"
]

def clean_ui_scraps(text: str) -> str:
    """Nettoie les scories d'UI copiées depuis Gemini, Claude ou ChatGPT."""
    if not text:
        return ""
    
    patterns = [
        r"^Copier la réponse$",
        r"^Copy code$",
        r"^Copy$",
        r"^Généré par Gemini$",
        r"^ChatGPT a dit\s*:?$",
        r"^Claude says\s*:?$",
        r"^Share response$",
        r"^Retry$",
        r"^Modifier le prompt$"
    ]
    
    cleaned = text
    for pat in patterns:
        cleaned = re.sub(pat, "", cleaned, flags=re.MULTILINE | re.IGNORECASE)
    
    # Réduire les lignes vides multiples (max 2 lignes vides)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()

def extract_title_and_aura(text: str):
    """Extrait un titre propre et déduit l'Aura de la note."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return "Nouvelle Réflexion", "Inspirations & Idées brutes"
    
    # 1. Extraction du Titre
    first_line = lines[0]
    if first_line.startswith('#'):
        title = re.sub(r'^#+\s*', '', first_line).strip()
    else:
        # Prendre la première phrase ou 60 premiers caractères
        match = re.match(r'^[^.!?\n]+[.!?]', first_line)
        candidate = match.group(0).strip() if match else first_line
        title = (candidate[:57] + '...') if len(candidate) > 60 else candidate

    # 2. Déduction de l'Aura par mots-clés
    lower_text = text.lower()
    if re.search(r'\b(décision|choix|stratégie|arbitrage|vision|priorité)\b', lower_text):
        aura = "Stratégie & Décisions"
    elif re.search(r'\b(todo|action|objectif|étape|tâche|jalon|plan)\b', lower_text):
        aura = "Actions & Objectifs"
    elif re.search(r'\b(code|api|architecture|db|base de données|fonction|script|backend|frontend)\b', lower_text):
        aura = "Technique & Architecture"
    elif re.search(r'\b(process|workflow|procédure|pipeline|méthode|flux)\b', lower_text):
        aura = "Workflows & Processus"
    else:
        aura = "Inspirations & Idées brutes"
        
    return title or "Sans titre", aura

def format_structured_markdown(text: str, title: str = None, aura: str = None) -> str:
    """Structure élégamment le Markdown avec en-tête Frontmatter et sections nettes."""
    cleaned_content = clean_ui_scraps(text)
    
    extracted_title, extracted_aura = extract_title_and_aura(cleaned_content)
    final_title = title if title else extracted_title
    final_aura = aura if aura else extracted_aura
    
    # Supprimer la première ligne si elle répète le titre principal
    lines = cleaned_content.split('\n')
    if lines and lines[0].strip().startswith('#') and extracted_title.lower() in lines[0].lower():
        body_content = '\n'.join(lines[1:]).strip()
    else:
        body_content = cleaned_content

    # Harmoniser les listes et puces Markdown
    body_content = re.sub(r'^\s*[\*\•]\s+', '- ', body_content, flags=re.MULTILINE)
    
    now_iso = datetime.now().isoformat()
    
    formatted_md = f"""---
title: "{final_title}"
aura: "{final_aura}"
date: "{now_iso}"
source: "Python-Cleaner"
---

# {final_title}

{body_content}

---
"""
    return formatted_md

def process_file_or_string(input_data: str, is_file: bool = False) -> str:
    """Traite un texte brut ou un fichier complet Monidée.md."""
    if is_file:
        with open(input_data, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = input_data
        
    return format_structured_markdown(content)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Clean and structure AuraNote Markdown content.")
    parser.add_argument('input', nargs='?', help="Fichier Markdown ou texte brut à nettoyer.")
    parser.add_argument('--title', help="Titre explicite (optionnel)")
    parser.add_argument('--aura', help="Aura explicite (optionnelle)")
    parser.add_argument('--json', action='store_true', help="Sortie au format JSON pour l'API AuraNote")
    
    args = parser.parse_args()
    
    if not args.input:
        # Lire depuis stdin si aucun fichier/texte passé
        raw_text = sys.stdin.read()
    else:
        # Vérifier si c'est un fichier existant
        try:
            with open(args.input, 'r', encoding='utf-8') as f:
                raw_text = f.read()
        except Exception:
            raw_text = args.input

    if not raw_text.strip():
        print("Erreur : Aucun contenu à traiter.", file=sys.stderr)
        sys.exit(1)
        
    cleaned_md = format_structured_markdown(raw_text, title=args.title, aura=args.aura)
    
    if args.json:
        title, aura = extract_title_and_aura(clean_ui_scraps(raw_text))
        print(json.dumps({
            "title": args.title or title,
            "content": clean_ui_scraps(raw_text),
            "aura": args.aura or aura,
            "markdown": cleaned_md
        }, ensure_ascii=False, indent=2))
    else:
        print(cleaned_md)
