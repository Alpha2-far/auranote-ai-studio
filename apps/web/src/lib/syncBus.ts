/**
 * Petit bus pour déclencher une synchro après une mutation locale,
 * sans dépendance circulaire entre db.ts et sync.ts.
 */
type Runner = () => void;
let runner: Runner | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;

export function setSyncRunner(fn: Runner) {
  runner = fn;
}

/** Programme une synchro debouncée (~800 ms) après une modification locale. */
export function scheduleSync() {
  if (!runner) return;
  clearTimeout(timer);
  timer = setTimeout(() => runner?.(), 800);
}
