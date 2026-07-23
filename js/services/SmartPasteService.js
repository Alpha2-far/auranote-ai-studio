/**
 * AuraNote AI Studio - Smart Paste Service
 * TASK-003 Implementation
 */

import { sanitizeHTML, cleanAiUiNoise } from '../utils/sanitizer.js';
import { Note } from '../models/Note.js';
import { AURA_TYPES, DEFAULT_AURA } from '../config.js';

class SmartPasteService {
  /**
   * Read raw text directly from system clipboard
   * @returns {Promise<string>}
   */
  async readClipboardText() {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error('L\'accès au presse-papier n\'est pas supporté par ce navigateur.');
    }
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      throw new Error(`Accès au presse-papier refusé : ${err.message}`);
    }
  }

  /**
   * Extract title from text according to specification rules
   * @param {string} text
   * @returns {string}
   */
  extractTitle(text) {
    if (!text || !text.trim()) return 'Nouvelle Réflexion';

    const lines = text.trim().split('\n');
    const firstLine = lines[0].trim();

    // Règle 1: Titre Markdown (# ou ##)
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '').trim();
    }

    // Règle 2: Première phrase (max 60 caractères)
    const sentenceMatch = firstLine.match(/^[^.!?\n]+[.!?]/);
    let candidate = sentenceMatch ? sentenceMatch[0].trim() : firstLine;

    if (candidate.length > 60) {
      candidate = candidate.substring(0, 57).trim() + '...';
    }

    return candidate || 'Sans titre';
  }

  /**
   * Categorize note text into an Aura using heuristic keyword matching
   * @param {string} text
   * @returns {string}
   */
  categorizeAura(text) {
    if (!text) return DEFAULT_AURA;
    const lower = text.toLowerCase();

    // Règle A: Stratégie & Décisions
    if (/\b(décision|choix|stratégie|arbitrage|vision|priorité)\b/i.test(lower)) {
      return 'Stratégie & Décisions';
    }

    // Règle B: Actions & Objectifs
    if (/\b(todo|action|objectif|étape|tâche|jalon|plan)\b/i.test(lower)) {
      return 'Actions & Objectifs';
    }

    // Règle C: Technique & Architecture
    if (/\b(code|api|architecture|db|base de données|fonction|script|backend|frontend)\b/i.test(lower)) {
      return 'Technique & Architecture';
    }

    // Règle D: Workflows & Processus
    if (/\b(process|workflow|procédure|pipeline|méthode|flux)\b/i.test(lower)) {
      return 'Workflows & Processus';
    }

    // Par défaut
    return 'Inspirations & Idées brutes';
  }

  /**
   * Process raw input text into a clean Note instance
   * @param {string} rawText
   * @param {string} [source='SmartPaste']
   * @returns {Note}
   */
  processRawText(rawText, source = 'SmartPaste') {
    if (!rawText || !rawText.trim()) {
      throw new Error('Le texte fourni est vide.');
    }

    // 1. Nettoyage des scories UI et XSS
    const sanitized = sanitizeHTML(rawText);
    const cleanedContent = cleanAiUiNoise(sanitized);

    // 2. Détection du titre
    const title = this.extractTitle(cleanedContent);

    // 3. Classification par Aura
    const aura = this.categorizeAura(cleanedContent);

    // 4. Instanciation du modèle Note
    return new Note({
      title,
      content: cleanedContent,
      aura,
      source
    });
  }

  /**
   * Perform end-to-end Smart Paste from clipboard
   * @param {string} [source='SmartPaste']
   * @returns {Promise<Note>}
   */
  async smartPaste(source = 'SmartPaste') {
    const rawText = await this.readClipboardText();
    return this.processRawText(rawText, source);
  }
}

export const smartPasteService = new SmartPasteService();
export default smartPasteService;
