# DirectStay wake doorbell

Purpose: make owner-facing AI draft revisions fast while keeping the durable job queue in Supabase.

## Flow

1. The Vercel app saves the AI revision job/draft in the production database.
2. The app makes a best-effort POST to `DIRECTSTAY_OPENCLAW_WAKE_URL` with a small payload such as `{ kind: "villa_ai_revision", id, label }`.
3. A Cloudflare Tunnel routes that public URL to the Mac Studio loopback service at `http://127.0.0.1:18987/wake`.
4. `directstay-wake-doorbell.mjs` validates the bearer secret, starts the local AI draft worker immediately, and returns `202` without waiting for AI generation.
5. The owner portal keeps polling for the completed draft. The normal 30-second launchd worker remains the fallback if the tunnel or wake fails.

The wake call is only a doorbell. It never carries full owner/guest content; the worker reads the real job context from the authenticated internal API/database path.

## Local service

Files:

- `scripts/directstay-wake-doorbell.mjs`
- `scripts/run-directstay-wake-doorbell.sh`
- `scripts/com.directstay.wake-doorbell.plist`

Environment:

- `.directstay-ai-worker.env` supplies the existing site URL/internal API secret/model/generator.
- Optional `.directstay-wake.env` can override:
  - `DIRECTSTAY_WAKE_HOST=127.0.0.1`
  - `DIRECTSTAY_WAKE_PORT=18987`
  - `DIRECTSTAY_WAKE_SECRET=<same value used by Vercel DIRECTSTAY_OPENCLAW_WAKE_SECRET>`

If `DIRECTSTAY_WAKE_SECRET` is omitted, the service falls back to `DIRECTSTAY_INTERNAL_API_SECRET` for auth. A separate wake secret is cleaner for production.

Install locally after secrets are set:

```bash
mkdir -p /Users/agents/.openclaw/logs
cp scripts/com.directstay.wake-doorbell.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.directstay.wake-doorbell.plist
launchctl enable gui/$(id -u)/com.directstay.wake-doorbell
launchctl kickstart -k gui/$(id -u)/com.directstay.wake-doorbell
curl http://127.0.0.1:18987/healthz
```

## Cloudflare Tunnel shape

Use a narrow hostname/path that only points to the doorbell, for example:

```yaml
tunnel: directstay-bishop-wake
credentials-file: /Users/agents/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: bishop-wake.directstay.app
    path: /wake
    service: http://127.0.0.1:18987
  - hostname: bishop-wake.directstay.app
    path: /healthz
    service: http://127.0.0.1:18987
  - service: http_status:404
```

Vercel environment variables:

- `DIRECTSTAY_OPENCLAW_WAKE_URL=https://bishop-wake.directstay.app/wake`
- `DIRECTSTAY_OPENCLAW_WAKE_SECRET=<same as local DIRECTSTAY_WAKE_SECRET>`

Security notes:

- Do not tunnel the OpenClaw dashboard/control UI for this workflow.
- Keep the doorbell on loopback only.
- The public endpoint accepts only POST `/wake`, requires bearer auth, and only starts known local workers.
- Supabase/internal API remains the durable source of truth.
