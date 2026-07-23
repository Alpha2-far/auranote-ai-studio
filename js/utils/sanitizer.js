/**
 * AuraNote AI Studio - Sanitizer & Text Cleaner Utility
 * TASK-003 Implementation
 */

/**
 * Remove XSS script tags and dangerous HTML attributes
 * @param {string} input
 * @returns {string}
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Remove UI artifacts copied from AI platforms (Gemini, Claude, ChatGPT)
 * @param {string} text
 * @returns {string}
 */
export function cleanAiUiNoise(text) {
  if (typeof text !== 'string') return '';

  let cleaned = text;

  // Pattern de scories UI fréquentes dans Gemini / Claude / ChatGPT
  const uiPatterns = [
    /^Copier la réponse$/gm,
    /^Copy code$/gm,
    /^Copy$/gm,
    /^Généré par Gemini$/gm,
    /^ChatGPT a dit :$/gm,
    /^Claude says:$/gm,
    /^Share response$/gm,
    /^Retry$/gm,
    /^Modifier le prompt$/gm
  ];

  uiPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Nettoyage des retours à la ligne triples ou plus
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
}
