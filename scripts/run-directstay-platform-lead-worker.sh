#!/bin/zsh
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd /Users/agents/.openclaw/workspace/villa-la-percha
exec /opt/homebrew/bin/node scripts/directstay-platform-lead-worker.mjs
