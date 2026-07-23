// Configuration partagée de l'extension (endpoint API + secret).
export const DEFAULTS = {
  apiBase: 'http://localhost:3000',
  apiSecret: '',
};

export async function getConfig() {
  const stored = await chrome.storage.local.get(['apiBase', 'apiSecret']);
  return {
    apiBase: stored.apiBase || DEFAULTS.apiBase,
    apiSecret: stored.apiSecret ?? DEFAULTS.apiSecret,
  };
}

// Envoie une capture à l'API d'ingestion AuraNote.
export async function sendToAuraNote({ content, title, source }) {
  const { apiBase, apiSecret } = await getConfig();
  const headers = { 'Content-Type': 'application/json' };
  if (apiSecret) headers['Authorization'] = `Bearer ${apiSecret}`;
  const res = await fetch(`${apiBase}/api/v1/notes/ingest`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, title, source: source || 'Extension' }),
  });
  if (!res.ok) throw new Error(`Ingestion échouée (${res.status})`);
  return res.json();
}
