# Sarasota River Retreat — Post-Render Rubric Review (2026-05-15)

Status: internal benchmark review only. Not owner-shareable. No owner contact, external share, production database write, booking, payment, or inquiry action was performed.

## Inputs

- Local fixture route: `/p/sarasota-river-retreat-preview?view=guest` outside production only.
- Fixture payload: `directstay/src/data/sarasota-river-retreat-preview-fixture.json`
- QA evidence: `directstay/docs/platform-leads/sarasota-river-retreat-fixture-qa-evidence-2026-05-15.md`
- Rubric: `directstay/docs/platform-leads/preview-build-evaluation-rubric.md`

## Scoring

| Category | Score 1-5 | Notes |
|---|---:|---|
| Property understanding | 4 | The render clearly centers a small Sarasota / Phillippi River waterfront stay, sleeps-6 planning, owner care, and water/pool/spa/dock questions. It correctly separates observed facts from launch/owner-confirmation needs. |
| Visual fit to photos/location | 3 | Palette and rhythm match the Gulf river-retreat fingerprint, but the render has only one confirmed property image. The text-forward hero is the right safe choice, but the page cannot yet show a persuasive exterior/water/pool story. |
| Owner/decor style interpretation | 3 | The living-room trust image and quieter editorial treatment respect the available source. Decor interpretation remains shallow because the source image set is too thin. |
| Guest desire and trust | 3 | The page answers useful pre-inquiry questions and avoids unsupported promises. Desire is intentionally restrained until real exterior, water, pool, and local recommendation evidence is available. |
| DirectStay sales value | 4 | The preview demonstrates DirectStay's owner-correction path, clearer inquiry planning, trip-total structure, and content strategy without pretending to be a live booking page. |
| Copy quality | 4 | Guest copy is specific, practical, and scrubbed of internal/process language. It avoids numeric claims, fake savings, unsupported wildlife/location promises, and generic travel filler. |
| Mobile composition | 4 | Prior CDP QA shows readable desktop/mobile layout, no horizontal clipping, no blank hero placeholder, and owner callouts hidden from guest view. |
| Safety / preview constraints | PASS | Internal fixture only; local route is disabled in production; no booking/payment/inquiry submission; no production DB row; no fake rates, availability, distances, reviews, or owner-private data. |
| Technical polish | 4 | Fixture QA, focused lint, typecheck, and CDP visual checks passed. Remaining nuisance was only the local Next dev indicator, not page content. |

Average score: 3.63 across scored numeric categories.

Shareable? no.

## Owner-Share Blockers

- Full owner/gallery photo set and photo-rights approval are missing.
- Safe exterior, water, pool/spa, dock, kayak, firepit, and hero imagery are missing.
- Rates, taxes, deposits, cancellation, availability, minimum stays, and fee assumptions are unapproved.
- Bed/bath layout, parking, pets, children, accessibility, events, quiet hours, pool/spa/dock/kayak/firepit rules, and local recommendations need owner confirmation.
- The preview still needs a human full-scroll review after any richer image/content pass.

## Decision

The Sarasota fixture is useful as an internal DirectStay Preview Build learning artifact and a thin-image safety benchmark. It is not ready for owner review or external sharing. The next safe refinement step is to either obtain/inspect a real gallery/photo-rights package or choose another benchmark with enough source-safe imagery to test a more persuasive owner-ready preview.
