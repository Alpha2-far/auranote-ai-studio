/** Base de l'API serveur. En dev, Vite proxifie /api vers localhost:3000. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');
