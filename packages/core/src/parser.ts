/**
 * @auranote/core — Moteur de nettoyage & segmentation déterministe (100% local, sans IA payante).
 * Porté depuis js/utils/sanitizer.js et scripts/clean_and_structure.py.
 */

import type { Block, CalloutStyle, ParsedNote, Section } from './types';

const UI_NOISE_PATTERNS: RegExp[] = [
  /^Copier la réponse$/gm,
  /^Copy code$/gm,
  /^Copy$/gm,
  /^Généré par Gemini$/gm,
  /^ChatGPT a dit\s*:?$/gm,
  /^Claude says\s*:?$/gm,
  /^Share response$/gm,
  /^Retry$/gm,
  /^Regenerate$/gm,
  /^Modifier le prompt$/gm,
];

/** Retire les scories d'UI copiées depuis Gemini / Claude / ChatGPT. */
export function cleanAiUiNoise(text: unknown): string {
  if (typeof text !== 'string') return '';
  let cleaned = text;
  for (const pattern of UI_NOISE_PATTERNS) cleaned = cleaned.replace(pattern, '');
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}

interface CalloutRule {
  pattern: RegExp;
  style: CalloutStyle;
  label: string;
}

const CALLOUT_RULES: CalloutRule[] = [
  { pattern: /^(?:L'|l')?intuition\s+clé\s*:?\s*/i, style: 'intuition', label: "L'intuition clé" },
  { pattern: /^(?:La\s+)?clarification\s*:?\s*/i, style: 'clarification', label: 'La clarification' },
  { pattern: /^(?:La\s+)?double\s+réalité\s*(?:identifiée)?\s*:?\s*/i, style: 'insight', label: 'La double réalité' },
  { pattern: /^Côté\s+Non-Devs\s*(?:\([^)]*\))?\s*:?\s*/i, style: 'perspective', label: 'Côté Non-Devs' },
  { pattern: /^Côté\s+Devs\s*(?:\([^)]*\))?\s*:?\s*/i, style: 'perspective', label: 'Côté Devs' },
  { pattern: /^(?:Point\s+clé|À\s+retenir|Note\s+importante)\s*:?\s*/i, style: 'warning', label: 'Point clé' },
];

const NUM_SECTION_RE = /^(?:#+\s*)?(\d+)[.)/]\s+(.+)$/;

/** Segmente un texte nettoyé en sections numérotées + blocs (texte, puces, callouts). */
export function segmentTextIntoSections(text: string): Section[] {
  const cleaned = cleanAiUiNoise(text);
  const lines = cleaned.split('\n');
  const sections: Section[] = [];
  let current: Section = { id: 'sec-0', number: 0, title: 'Introduction', blocks: [] };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    const numMatch = line.match(NUM_SECTION_RE);
    if (numMatch) {
      if (current.blocks.length > 0 || current.number > 0) sections.push(current);
      const secNum = parseInt(numMatch[1], 10);
      current = { id: `sec-${secNum}`, number: secNum, title: numMatch[2].trim(), blocks: [] };
      i++;
      continue;
    }

    let matched: Block | null = null;
    for (const rule of CALLOUT_RULES) {
      const m = line.match(rule.pattern);
      if (!m) continue;
      const afterLabel = line.substring(m[0].length).trim();
      const contentLines = afterLabel ? [afterLabel] : [];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (!next || NUM_SECTION_RE.test(next)) break;
        if (CALLOUT_RULES.some((r) => r.pattern.test(next))) break;
        contentLines.push(next);
        j++;
      }
      matched = { type: 'callout', style: rule.style, label: rule.label, content: contentLines.join('\n').trim() };
      i = j;
      break;
    }

    if (matched) {
      current.blocks.push(matched);
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      current.blocks.push({ type: 'bullet', content: line.replace(/^[-*•]\s*/, '').trim() });
    } else {
      current.blocks.push({ type: 'text', content: line });
    }
    i++;
  }

  if (current.blocks.length > 0 || current.number > 0) sections.push(current);
  return sections;
}

/** Extrait un titre : ligne "# Titre", sinon 1re phrase, tronquée. */
export function extractTitle(text: string): string {
  const cleaned = cleanAiUiNoise(text);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return 'Sans titre';

  const heading = lines.find((l) => /^#+\s+/.test(l));
  if (heading) return heading.replace(/^#+\s+/, '').trim().slice(0, 120);

  const first = lines[0].replace(NUM_SECTION_RE, '$2');
  const sentence = first.split(/(?<=[.!?])\s/)[0] || first;
  return sentence.slice(0, 120).trim() || 'Sans titre';
}

/** Reconstruit un Markdown propre à partir des sections. */
export function sectionsToMarkdown(sections: Section[]): string {
  const out: string[] = [];
  for (const sec of sections) {
    if (sec.number > 0) out.push(`## ${sec.number}. ${sec.title}`);
    else if (sec.title && sec.title !== 'Introduction') out.push(`## ${sec.title}`);
    for (const block of sec.blocks) {
      if (block.type === 'callout') out.push(`> **${block.label ?? 'Note'}** — ${block.content}`);
      else if (block.type === 'bullet') out.push(`- ${block.content}`);
      else out.push(block.content);
    }
    out.push('');
  }
  return out.join('\n').trim();
}

/** Pipeline complet : texte brut → note structurée. */
export function parseRawText(raw: string, explicitTitle?: string): ParsedNote {
  const cleaned = cleanAiUiNoise(raw);
  const sections = segmentTextIntoSections(cleaned);
  const title = (explicitTitle && explicitTitle.trim()) || extractTitle(cleaned);
  return { title, sections, contentMarkdown: sectionsToMarkdown(sections) };
}
