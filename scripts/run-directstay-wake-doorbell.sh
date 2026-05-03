#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
set -a
source /Users/agents/.openclaw/workspace/.directstay-ai-worker.env
if [ -f /Users/agents/.openclaw/workspace/.directstay-wake.env ]; then
  source /Users/agents/.openclaw/workspace/.directstay-wake.env
fi
set +a
export DIRECTSTAY_AI_DRAFT_COMMAND="/opt/homebrew/bin/node /Users/agents/.openclaw/workspace/villa-la-percha/scripts/directstay-ai-draft-generator-openclaw.mjs"
cd /Users/agents/.openclaw/workspace/villa-la-percha
exec /opt/homebrew/bin/node scripts/directstay-wake-doorbell.mjs
