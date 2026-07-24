"""Analyse locale : mots-clés, résumé extractif, classification — sans IA externe."""
from __future__ import annotations

import re
from collections import Counter
from typing import Dict, List

from .text import clean_ui_noise

# Mots vides français + anglais courants (liste volontairement compacte).
STOPWORDS = {
    "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "mais", "donc", "car", "ni",
    "que", "qui", "quoi", "dont", "où", "ce", "cet", "cette", "ces", "se", "sa", "son", "ses",
    "mon", "ma", "mes", "ton", "ta", "tes", "notre", "nos", "votre", "vos", "leur", "leurs",
    "il", "elle", "ils", "elles", "on", "nous", "vous", "je", "tu", "me", "te", "lui", "en", "y",
    "au", "aux", "dans", "par", "pour", "sur", "avec", "sans", "sous", "vers", "chez", "entre",
    "est", "sont", "être", "était", "sera", "a", "as", "ont", "avait", "avoir", "fait", "faire",
    "pas", "plus", "moins", "très", "trop", "peu", "aussi", "encore", "déjà", "toujours", "jamais",
    "ne", "n", "d", "l", "c", "s", "j", "m", "t", "qu", "si", "comme", "quand", "alors", "puis",
    "cela", "ça", "ceci", "celui", "celle", "ceux", "tout", "tous", "toute", "toutes", "même",
    "the", "a", "an", "of", "to", "in", "is", "are", "and", "or", "for", "on", "with", "this",
    "that", "it", "as", "be", "by", "at", "from", "we", "you", "they", "not",
}

_WORD = re.compile(r"[a-zà-öø-ÿ0-9][a-zà-öø-ÿ0-9'-]*", re.IGNORECASE)
_SENTENCE = re.compile(r"(?<=[.!?])\s+")


def _tokens(text: str) -> List[str]:
    return [w.lower() for w in _WORD.findall(text)]


def _content_tokens(text: str) -> List[str]:
    return [w for w in _tokens(text) if len(w) >= 3 and w not in STOPWORDS]


def extract_keywords(text: str, top_n: int = 8) -> List[str]:
    """Mots-clés par fréquence (hors mots vides), les plus fréquents d'abord."""
    tokens = _content_tokens(clean_ui_noise(text))
    if not tokens:
        return []
    counts = Counter(tokens)
    return [w for w, _ in counts.most_common(top_n)]


def extractive_summary(text: str, max_sentences: int = 3) -> str:
    """Résumé extractif : phrases les mieux notées par densité de mots-clés, dans l'ordre d'origine."""
    cleaned = clean_ui_noise(text)
    # Retire les titres Markdown et puces pour ne garder que la prose.
    prose = "\n".join(
        ln for ln in cleaned.split("\n") if ln.strip() and not re.match(r"^\s*(#+|[-*•])\s", ln)
    )
    sentences = [s.strip() for s in _SENTENCE.split(prose.replace("\n", " ")) if s.strip()]
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    freq = Counter(_content_tokens(prose))
    if not freq:
        return " ".join(sentences[:max_sentences])

    def score(sentence: str) -> float:
        words = _content_tokens(sentence)
        if not words:
            return 0.0
        return sum(freq[w] for w in words) / (len(words) ** 0.5)

    ranked = sorted(range(len(sentences)), key=lambda i: score(sentences[i]), reverse=True)
    chosen = sorted(ranked[:max_sentences])
    return " ".join(sentences[i] for i in chosen)


# Règles de classification par Aura (mot-clé -> aura), déterministes.
_AURA_RULES = [
    ("Stratégie & Décisions", r"\b(décision|décisions|choix|stratégie|stratégique|arbitrage|vision|priorité|priorités|enjeu|objectif stratégique)\b"),
    ("Actions & Objectifs", r"\b(todo|à faire|action|actions|objectif|objectifs|étape|étapes|tâche|tâches|jalon|deadline|échéance|planning)\b"),
    ("Technique & Architecture", r"\b(code|api|architecture|db|base de données|fonction|script|backend|frontend|serveur|déploiement|bug|refactor|algorithme|schéma)\b"),
    ("Workflows & Processus", r"\b(process|processus|workflow|procédure|pipeline|méthode|méthodologie|flux|automatisation|étape du process)\b"),
]
DEFAULT_AURA = "Inspirations & Idées brutes"


def classify_aura(text: str) -> Dict[str, object]:
    """Suggère une Aura par comptage de mots-clés (retourne l'aura + score + alternatives)."""
    lower = clean_ui_noise(text).lower()
    scores: Dict[str, int] = {}
    for aura, pattern in _AURA_RULES:
        scores[aura] = len(re.findall(pattern, lower))

    best = max(scores, key=lambda k: scores[k]) if scores else DEFAULT_AURA
    if scores.get(best, 0) == 0:
        best = DEFAULT_AURA
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    return {
        "aura": best,
        "score": scores.get(best, 0),
        "alternatives": [a for a, s in ranked if s > 0 and a != best],
    }
