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

Additional local-renderer verification after wiring the fixture into the non-production preview route:

```bash
cd /Users/agents/.openclaw/workspace/directstay
npx eslint 'src/app/p/[slug]/page.tsx'
npx tsc --noEmit
```

Result: both passed with no output.

Visual QA follow-up after the first screenshot pass found mobile horizontal clipping, a blank hero placeholder, and guest-visible source-review wording. The route and fixture were tightened, then rechecked with Chrome DevTools Protocol device metrics:

```bash
cd /Users/agents/.openclaw/workspace/directstay
npm run qa:sarasota-fixture
npx eslint 'src/app/layout.tsx' 'src/app/p/[slug]/page.tsx'
npx tsc --noEmit
```

CDP visual evidence:

- Desktop: `qa/browser-sweeps/sarasota-preview-visual-2026-05-15/desktop-cdp-final.png`
- Mobile: `qa/browser-sweeps/sarasota-preview-visual-2026-05-15/mobile-cdp-final.png`
- Desktop viewport metrics: `innerWidth=1440`, `scrollWidth=1425`, guest sections `6`, owner callouts `0`.
- Mobile viewport metrics: `innerWidth=390`, `scrollWidth=390`, guest sections `6`, owner callouts `0`.

Visual inspection result: readable desktop/mobile layout, no horizontal clipping, no blank hero placeholder, and no owner/internal callouts visible in `?view=guest`. The only observed nuisance is the Next dev indicator overlapping the bottom-left edge during local development; it is not page content.

## Evidence summary

- Fixture remains explicitly `fixtureOnly` and `internal-only`.
- Preview posture remains read-only; no booking, payment, inquiry submission, or production write path was used.
- Hero remains text-forward with no image.
- The only allowed preview image remains `uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp`, constrained to the owner-care/interior-trust section.
- Eleven source assets remain rejected for hero/property-story use, including logo, attraction, restaurant, skyline/canal, and generic background assets.
- Guest-facing section corpus passes the internal/process bad-copy denylist used by the fixture QA.
- Guest-facing copy now avoids source-review phrasing such as `source-observed`, `owner-confirmed`, `owner confirmation`, and `stay-fit` in visible planning sections.
- Unsupported numeric rate, fee, savings, distance, and exact travel-time claims remain absent.
- `src/app/p/[slug]/page.tsx` now loads `src/data/sarasota-river-retreat-preview-fixture.json` only when `NODE_ENV !== "production"` and the slug is `sarasota-river-retreat-preview`, so the fixture can render locally without a production database row.
- The fixture route preserves the text-forward hero by treating `heroTextOnly` as the hero section and not borrowing the approved living-room image as hero art.
- The text-forward hero now renders as text-only rather than as a blank placeholder visual when no approved hero image exists.

## Current recommendation

Do not owner-share this Sarasota preview. The local guest render now passes the basic visual QA gate, but the benchmark still needs full-scroll review and post-render rubric scoring before it can be cited as more than an internal learning artifact.
