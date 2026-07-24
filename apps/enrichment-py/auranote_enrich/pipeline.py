"""Pipeline d'enrichissement complet : texte brut -> objet structuré."""
from __future__ import annotations

from typing import Any, Dict, Optional

from .text import clean_ui_noise, extract_title, segment_sections, sections_to_markdown
from .analyze import extract_keywords, extractive_summary, classify_aura


def enrich(text: str, title: Optional[str] = None) -> Dict[str, Any]:
    """
    Enrichit un texte localement (aucune IA externe) :
    nettoyage, titre, sections, mots-clés, résumé, Aura/tags suggérés.
    """
    cleaned = clean_ui_noise(text)
    sections = segment_sections(cleaned)
    aura = classify_aura(cleaned)
    keywords = extract_keywords(cleaned)
    return {
        "title": (title.strip() if title and title.strip() else extract_title(cleaned)),
        "cleaned": cleaned,
        "markdown": sections_to_markdown(sections),
        "sections": sections,
        "keywords": keywords,
        "summary": extractive_summary(cleaned),
        "suggestedAura": aura["aura"],
        "auraScore": aura["score"],
        # Tags suggérés = l'Aura la plus probable + les 3 premiers mots-clés (dé-doublonnés).
        "suggestedTags": _dedupe([aura["aura"], *keywords[:3]]),
    }


def _dedupe(items):
    seen = set()
    out = []
    for it in items:
        key = it.lower()
        if it and key not in seen:
            seen.add(key)
            out.append(it)
    return out
