/**
 * @auranote/core — Nettoyage de sécurité et échappement HTML.
 * Porté depuis l'ancien js/utils/sanitizer.js.
 */

/** Retire les balises/attributs dangereux d'une chaîne (défense XSS de base). */
export function sanitizeHTML(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/** Échappe le texte pour une insertion sûre dans du HTML. */
export function escapeHTML(input: unknown): string {
  return sanitizeHTML(String(input ?? ''))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
