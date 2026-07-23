import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR ?? join(__dirname, '..', 'data');
const FILE = join(DATA_DIR, 'captures.json');

export interface Capture {
  id: string;
  title?: string;
  content: string;
  tags?: string[];
  source: string;
  createdAt: string;
}

let cache: Capture[] | null = null;

async function load(): Promise<Capture[]> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(FILE, 'utf8')) as Capture[];
  } catch {
    cache = [];
  }
  return cache;
}

async function flush(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(cache ?? [], null, 2));
}

/** Ajoute une capture en attente d'import par le client local-first. */
export async function addCapture(cap: Capture): Promise<void> {
  const all = await load();
  all.push(cap);
  await flush();
}

/** Renvoie les captures en attente. */
export async function listCaptures(): Promise<Capture[]> {
  return load();
}

/** Acquitte (retire) les captures importées par le client. */
export async function ackCaptures(ids: string[]): Promise<number> {
  const all = await load();
  const before = all.length;
  cache = all.filter((c) => !ids.includes(c.id));
  await flush();
  return before - cache.length;
}
