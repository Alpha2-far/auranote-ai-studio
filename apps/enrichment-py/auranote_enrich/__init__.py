"""
AuraNote — Moteur d'enrichissement local (100 % Python stdlib, AUCUNE IA externe).

Nettoie les réponses d'IA, segmente en sections, extrait des mots-clés et un
résumé, et suggère des tags/dossier — de façon entièrement déterministe et locale
(confidentialité, coût nul, hors-ligne).
"""
from .text import clean_ui_noise, extract_title, segment_sections, sections_to_markdown
from .analyze import extract_keywords, extractive_summary, classify_aura
from .pipeline import enrich

__all__ = [
    "clean_ui_noise",
    "extract_title",
    "segment_sections",
    "sections_to_markdown",
    "extract_keywords",
    "extractive_summary",
    "classify_aura",
    "enrich",
]

__version__ = "2.0.0"
