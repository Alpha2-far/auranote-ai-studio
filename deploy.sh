#!/usr/bin/env bash
# Déploiement AuraNote v2 → GitHub (déclenche le build Railway).
# Lit GITHUB_TOKEN depuis .env, remplace le contenu du dépôt par le nouveau code.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then echo "❌ .env introuvable."; exit 1; fi
set -a; . ./.env; set +a

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ GITHUB_TOKEN vide dans .env — colle ton token puis relance."; exit 1
fi
REPO="${GITHUB_REPO:-Alpha2-far/auranote-ai-studio}"

echo "→ Préparation du commit…"
git add -A
git commit -q -m "feat: AuraNote v2 — refonte complète (PWA React/Vite/TS + API + extension + connecteur MCP)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>" || echo "  (rien de nouveau à committer)"

echo "→ Push (force) vers $REPO …"
# Le token n'est jamais écrit dans la config git : URL éphémère passée en ligne.
git push --force "https://x-access-token:${GITHUB_TOKEN}@github.com/${REPO}.git" HEAD:main

echo "✅ Déployé. Vérifie le build sur Railway (connecté à $REPO)."
echo "🔒 Pense à révoquer le token GitHub maintenant."
