"""Nettoyage, segmentation et extraction de titre — déterministe, sans dépendance."""
from __future__ import annotations

import re
from typing import Any, Dict, List

_UI_NOISE = [
    re.compile(p, re.IGNORECASE | re.MULTILINE)
    for p in (
        r"^Copier la réponse$",
        r"^Copy code$",
        r"^Copy$",
        r"^Généré par Gemini$",
        r"^ChatGPT a dit\s*:?$",
        r"^Claude says\s*:?$",
        r"^Share response$",
        r"^Retry$",
        r"^Regenerate$",
        r"^Modifier le prompt$",
    )
]

_CALLOUTS = [
    (re.compile(r"^(?:L'|l')?intuition\s+clé\s*:?\s*", re.IGNORECASE), "intuition", "L'intuition clé"),
    (re.compile(r"^(?:La\s+)?clarification\s*:?\s*", re.IGNORECASE), "clarification", "La clarification"),
    (re.compile(r"^(?:La\s+)?double\s+réalité\s*(?:identifiée)?\s*:?\s*", re.IGNORECASE), "insight", "La double réalité"),
    (re.compile(r"^Côté\s+Non-Devs\s*(?:\([^)]*\))?\s*:?\s*", re.IGNORECASE), "perspective", "Côté Non-Devs"),
    (re.compile(r"^Côté\s+Devs\s*(?:\([^)]*\))?\s*:?\s*", re.IGNORECASE), "perspective", "Côté Devs"),
    (re.compile(r"^(?:Point\s+clé|À\s+retenir|Note\s+importante)\s*:?\s*", re.IGNORECASE), "warning", "Point clé"),
]

_NUM_SECTION = re.compile(r"^(?:#+\s*)?(\d+)[.)/]\s+(.+)$")


def clean_ui_noise(text: str) -> str:
    """Retire les scories d'UI copiées depuis Gemini / Claude / ChatGPT."""
    if not text:
        return ""
    cleaned = text
    for pat in _UI_NOISE:
        cleaned = pat.sub("", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def _match_callout(line: str):
    for pat, style, label in _CALLOUTS:
        m = pat.match(line)
        if m:
            return m, style, label
    return None


def segment_sections(text: str) -> List[Dict[str, Any]]:
    """Segmente un texte nettoyé en sections numérotées + blocs (texte, puces, callouts)."""
    cleaned = clean_ui_noise(text)
    lines = cleaned.split("\n")
    sections: List[Dict[str, Any]] = []
    current: Dict[str, Any] = {"id": "sec-0", "number": 0, "title": "Introduction", "blocks": []}

    i = 0
    n = len(lines)
    while i < n:
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        num = _NUM_SECTION.match(line)
        if num:
            if current["blocks"] or current["number"] > 0:
                sections.append(current)
            sec_num = int(num.group(1))
            current = {"id": f"sec-{sec_num}", "number": sec_num, "title": num.group(2).strip(), "blocks": []}
            i += 1
            continue

        matched = _match_callout(line)
        if matched:
            m, style, label = matched
            after = line[m.end():].strip()
            content_lines = [after] if after else []
            j = i + 1
            while j < n:
                nxt = lines[j].strip()
                if not nxt or _NUM_SECTION.match(nxt) or _match_callout(nxt):
                    break
                content_lines.append(nxt)
                j += 1
            current["blocks"].append(
                {"type": "callout", "style": style, "label": label, "content": "\n".join(content_lines).strip()}
            )
            i = j
            continue

        if re.match(r"^[-*•]\s+", line):
            current["blocks"].append({"type": "bullet", "content": re.sub(r"^[-*•]\s*", "", line).strip()})
        else:
            current["blocks"].append({"type": "text", "content": line})
        i += 1

    if current["blocks"] or current["number"] > 0:
        sections.append(current)
    return sections


def extract_title(text: str) -> str:
    """Extrait un titre : heading Markdown, sinon première phrase, tronqué à 120 car."""
    cleaned = clean_ui_noise(text)
    lines = [ln.strip() for ln in cleaned.split("\n") if ln.strip()]
    if not lines:
        return "Sans titre"

    for ln in lines:
        if re.match(r"^#+\s+", ln):
            return re.sub(r"^#+\s+", "", ln).strip()[:120]

    first = _NUM_SECTION.sub(r"\2", lines[0])
    sentence = re.split(r"(?<=[.!?])\s", first)[0] or first
    return sentence.strip()[:120] or "Sans titre"


def sections_to_markdown(sections: List[Dict[str, Any]]) -> str:
    """Reconstruit un Markdown propre à partir des sections segmentées."""
    out: List[str] = []
    for sec in sections:
        if sec["number"] > 0:
            out.append(f"## {sec['number']}. {sec['title']}")
        elif sec["title"] and sec["title"] != "Introduction":
            out.append(f"## {sec['title']}")
        for block in sec["blocks"]:
            if block["type"] == "callout":
                out.append(f"> **{block.get('label', 'Note')}** — {block['content']}")
            elif block["type"] == "bullet":
                out.append(f"- {block['content']}")
            else:
                out.append(block["content"])
        out.append("")
    return "\n".join(out).strip()
