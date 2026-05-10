#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
set -a
source /Users/agents/.openclaw/workspace/.directstay-ai-worker.env
set +a
export DIRECTSTAY_AI_DRAFT_COMMAND="/opt/homebrew/bin/node /Users/agents/.openclaw/workspace/directstay/scripts/directstay-ai-draft-generator-openclaw.mjs"
cd /Users/agents/.openclaw/workspace/directstay
exec /opt/homebrew/bin/node scripts/directstay-ai-draft-worker.mjs
