#!/bin/zsh
set -a
source /Users/agents/.openclaw/workspace/.directstay-ai-worker.env
set +a
cd /Users/agents/.openclaw/workspace/villa-la-percha
exec /opt/homebrew/bin/node scripts/directstay-ai-draft-worker.mjs
