#!/usr/bin/env bash
#
# Ship the built dist/ to the server with an atomic release + symlink swap.
# Runs on the GitHub Actions runner. Keeps the last 3 releases on disk.
#
# Required env (provided by the workflow from GitHub Secrets):
#   SSH_PRIVATE_KEY   deploy private key (matches deploy user's authorized_keys)
#   DEPLOY_HOST       server IP / hostname
#   DEPLOY_USER       ssh user (e.g. "deploy")
# Optional:
#   DEPLOY_SSH_PORT   ssh port (default 22)
#
set -euo pipefail

: "${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY is required}"
: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
PORT="${DEPLOY_SSH_PORT:-22}"

BASE="/var/www/fabrik"
TS="$(date -u +%Y%m%d%H%M%S)"
SHA="${GITHUB_SHA:-manual}"
REL="${BASE}/releases/${TS}-${SHA:0:7}"

if [ ! -f dist/index.html ]; then
  echo "::error::dist/index.html not found — nothing to deploy" >&2
  exit 1
fi

# --- install the deploy key ---
mkdir -p ~/.ssh && chmod 700 ~/.ssh
printf '%s\n' "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
chmod 600 ~/.ssh/deploy_key
ssh-keyscan -p "$PORT" -H "$DEPLOY_HOST" >> ~/.ssh/known_hosts 2>/dev/null

SSH_OPTS="-i $HOME/.ssh/deploy_key -p $PORT -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "→ Creating release dir: $REL"
ssh $SSH_OPTS "$TARGET" "mkdir -p '$REL'"

echo "→ Uploading dist/ via rsync"
rsync -az --delete -e "ssh $SSH_OPTS" dist/ "${TARGET}:${REL}/"

echo "→ Activating release and pruning to last 3"
ssh $SSH_OPTS "$TARGET" "
  set -e
  ln -sfn '$REL' '${BASE}/current'
  cd '${BASE}/releases'
  ls -1dt */ 2>/dev/null | tail -n +4 | xargs -r rm -rf
  echo \"   active → \$(readlink '${BASE}/current')\"
"

echo "✓ Deployed: $REL"
