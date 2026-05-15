# Sarasota River Retreat — Fixture QA Evidence (2026-05-15)

## Scope

Internal-only DirectStay Preview Build refinement heartbeat. No owner contact, no external share, no production database write, and no live booking/payment/inquiry functionality.

## Inputs checked

- `directstay/docs/platform-leads/sarasota-river-retreat-render-fixture-packet-2026-05-14.md`
- `directstay/scripts/create-sarasota-river-retreat-preview-fixture.mjs --json`
- `directstay/scripts/qa-sarasota-river-retreat-fixture.mjs`

## Verification run

```bash
cd /Users/agents/.openclaw/workspace/directstay
npm run qa:sarasota-fixture
```

Result:

```text
Sarasota fixture QA passed (8 sections, 11 rejected assets).
```

## Evidence summary

- Fixture remains explicitly `fixtureOnly` and `internal-only`.
- Preview posture remains read-only; no booking, payment, inquiry submission, or production write path was used.
- Hero remains text-forward with no image.
- The only allowed preview image remains `uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp`, constrained to the owner-care/interior-trust section.
- Eleven source assets remain rejected for hero/property-story use, including logo, attraction, restaurant, skyline/canal, and generic background assets.
- Guest-facing section corpus passes the internal/process bad-copy denylist used by the fixture QA.
- Unsupported numeric rate, fee, savings, distance, and exact travel-time claims remain absent.

## Current recommendation

Do not owner-share this Sarasota preview. The next safe implementation step is to connect this fixture payload to a local/non-production renderer or preview route, then run desktop/mobile visual QA and guest-view bad-copy/image-integrity checks before considering any further benchmark scoring.
