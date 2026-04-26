# Inbound Email Routing via Cloudflare Email Worker

This is the recommended production setup for Villa La Percha inquiry replies.

## Goal

When a guest replies to an inquiry email:
1. the reply lands in the DirectStay app thread
2. a copy is forwarded to `villalapercha@gmail.com`
3. the owner still has a normal Gmail inbox for human use

## Recommended reply address

Use a branded reply address on the verified domain:

- `villalapercha@directstay.app`

Set this in Vercel as:

- `INQUIRY_REPLY_TO_EMAIL=villalapercha@directstay.app`

## Architecture

Guest reply -> `villalapercha@directstay.app` -> Cloudflare Email Routing Worker ->
- POST to `https://directstay.app/api/inquiry/reply-webhook`
- forward original email to `villalapercha@gmail.com`

The app uses the subject token `[DirectStay Inquiry <id>]` to append the reply to the correct thread.

## Cloudflare setup

### 1. Enable Email Routing
In Cloudflare for `directstay.app`:
- open **Email** / **Email Routing**
- ensure Email Routing is enabled for the domain
- verify `villalapercha@gmail.com` as a destination address if Cloudflare asks

### 2. Create the Email Worker
Create an Email Worker and paste the contents of:

- `cloudflare/inquiry-reply-worker.mjs`

Set these Worker environment variables:

- `FORWARD_TO_EMAIL=villalapercha@gmail.com`
- `INQUIRY_WEBHOOK_URL=https://directstay.app/api/inquiry/reply-webhook`
- `INQUIRY_WEBHOOK_SECRET=<same value as Vercel INQUIRY_WEBHOOK_SECRET>`

### 3. Bind the Worker to the reply address
Create a route for:

- `villalapercha@directstay.app`

and bind it to the Email Worker.

That route should be the address used in `INQUIRY_REPLY_TO_EMAIL`.

## App expectations

The webhook already supports:
- webhook secret auth
- subject-token inquiry matching
- sender validation against the original inquiry email
- duplicate suppression by message id
- Cloudflare raw email ingestion via `rawBase64`

## Verification checklist

1. Update Vercel:
   - `INQUIRY_REPLY_TO_EMAIL=villalapercha@directstay.app`
2. Redeploy the site
3. Submit a test inquiry
4. Send an approved reply from owner portal
5. Reply to that email from the guest inbox
6. Confirm:
   - the reply appears in owner portal thread
   - a copy arrives in `villalapercha@gmail.com`

## Failure modes

- If Cloudflare forwarding works but webhook fails, the owner still sees the email in Gmail.
- If webhook works but Gmail forwarding fails, the portal thread still captures the reply.
- If neither works, check:
  - Cloudflare Email Routing status
  - Worker env vars
  - `INQUIRY_WEBHOOK_SECRET`
  - Vercel function logs for `/api/inquiry/reply-webhook`
