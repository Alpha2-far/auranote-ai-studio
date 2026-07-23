import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR ?? join(__dirname, '..', 'data');
const FILE = join(DATA_DIR, 'tokens.json');

export interface ApiToken {
  id: string;
  token: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
}

/** Version masquée renvoyée aux listes (ne divulgue pas le token complet). */
export interface ApiTokenPublic {
  id: string;
  label: string;
  createdAt: string;
  expiresAt: string | null;
  preview: string;
  expired: boolean;
}

let cache: ApiToken[] | null = null;

async function load(): Promise<ApiToken[]> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(FILE, 'utf8')) as ApiToken[];
  } catch {
    cache = [];
  }
  return cache;
}

async function flush(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(cache ?? [], null, 2));
}

const isExpired = (t: ApiToken) => t.expiresAt !== null && Date.parse(t.expiresAt) < Date.now();

function toPublic(t: ApiToken): ApiTokenPublic {
  return {
    id: t.id,
    label: t.label,
    createdAt: t.createdAt,
    expiresAt: t.expiresAt,
    preview: `${t.token.slice(0, 7)}…${t.token.slice(-4)}`,
    expired: isExpired(t),
  };
}

export async function createToken(label: string, expiresInDays?: number): Promise<ApiToken> {
  const all = await load();
  const token: ApiToken = {
    id: randomBytes(8).toString('hex'),
    token: `ant_${randomBytes(24).toString('hex')}`,
    label: label?.trim() || 'Connecteur',
    createdAt: new Date().toISOString(),
    expiresAt:
      expiresInDays && expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
        : null,
  };
  all.push(token);
  await flush();
  return token;
}

export async function listTokens(): Promise<ApiTokenPublic[]> {
  return (await load()).map(toPublic);
}

export async function revokeToken(id: string): Promise<boolean> {
  const all = await load();
  const before = all.length;
  cache = all.filter((t) => t.id !== id);
  await flush();
  return before !== cache.length;
}

/** true si le jeton correspond à un token stocké et non expiré. */
export async function validateToken(token: string): Promise<boolean> {
  const all = await load();
  return all.some((t) => t.token === token && !isExpired(t));
}

/** Nombre de tokens actifs (non expirés). */
export async function activeTokenCount(): Promise<number> {
  return (await load()).filter((t) => !isExpired(t)).length;
}
