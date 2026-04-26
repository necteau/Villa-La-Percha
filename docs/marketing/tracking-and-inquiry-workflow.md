# Villa La Percha — Tracking and Inquiry Workflow

## Purpose
Create a simple system so every inquiry is captured, responded to quickly, and tracked back to a likely source.

## Tracking Plan

### Suggested Event Names
- `view_availability`
- `select_dates`
- `submit_inquiry`
- `click_email`
- `view_experience_page`
- `view_price_comparison`
- `view_map`

### Suggested Source Parameters
Whenever possible, capture basic source/UTM values:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

### Recommended Future Setup
- Google Analytics 4
- Google Search Console
- Meta Pixel only if/when Meta campaigns start

## Inquiry Workflow
1. Guest lands on site
2. Guest checks dates
3. Guest submits inquiry
4. Inquiry is stored in the inquiry thread system and surfaced in owner portal
5. Outbound reply drafts are generated/edited in owner portal and require approval before send
6. Sent replies are logged back into the inquiry timeline
7. Guest replies return through `/api/inquiry/reply-webhook` and append to the same thread
8. Respond within 24 hours
9. Log inquiry source, requested dates, and outcome
10. If booked, log booking source and value

## Current Reply / Inbox Architecture

### Outbound
- Drafts are stored as inquiry reply drafts with status (`draft`, `pending_owner_approval`, `approved`, `sent`)
- Approved drafts send via Resend
- Initial guest inquiries notify the configured inbox via `INQUIRY_NOTIFICATION_EMAIL`
- Subjects are tagged with `[DirectStay Inquiry <id>]` for reply threading
- Sent emails are logged as outbound inquiry messages for full conversation history

### Inbound
- Reply webhook authenticates with `INQUIRY_WEBHOOK_SECRET`
- Inquiry ID resolution order:
  1. explicit `inquiryId`
  2. `X-DirectStay-Inquiry-Id` header
  3. `[DirectStay Inquiry <id>]` subject token
- Sender is validated against the original inquiry email when available
- Duplicate replies are ignored when `messageId` already exists in the thread
- Webhook failures are logged to fallback storage for inspection

### Fallback / Local Mode
- If the database is unavailable, inquiry, reservation, pricing, webhook-failure, and analytics data fall back to JSON files under `src/data/`
- This keeps the portal usable during local development and partial setup without pretending the data layer is production-grade

## Current Analytics Foundation

Tracked event types currently include:
- `inquiry.submit`
- `inquiry.responded`
- `inquiry.converted`
- `page.view`
- `pricing.view`
- `availability.check`

Dashboard metrics currently surface:
- drafts awaiting approval
- conversations with replies sent
- average first-response speed
- inquiry conversion rate

## Lead Response Standard
- **Goal:** same day when practical, within 24 hours max
- If not ready with full answer, send a warm acknowledgment first
- Keep replies personal, fast, and specific to dates/group size

## Recommended Data to Track Per Inquiry
- Date received
- Guest name
- Email
- Check-in
- Check-out
- Nights
- Number of guests
- Children Y/N
- Source
- Status (new / replied / qualified / booked / lost)
- Direct quote sent Y/N
- Airbnb quote known Y/N
- VRBO quote known Y/N
- Notes

## Manual Workflow for Now
Until analytics and CRM are live:
- Use the inquiry inbox / owner portal as the trigger
- Record leads in a simple CSV or sheet when needed for marketing review
- Update status after each reply / booking decision
- Review fallback analytics/events files if production analytics is not wired yet

## Pricing Workflow
For selected date windows, record:
- direct nightly price
- Airbnb nightly price
- Airbnb fees
- Airbnb taxes
- VRBO nightly price
- VRBO fees
- VRBO taxes

Then enter these into `src/data/pricingTable.ts` so the website can calculate real total comparisons.

## Bottlenecks / Dependencies
- Resend API key must be configured in Vercel
- Live inquiry submission + reply-webhook test still needs to happen end-to-end
- Production inbound email routing still needs to be chosen and wired into the webhook
- Exact OTA pricing requires manual capture when platforms block automation
