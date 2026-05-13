# Preview Build Benchmark Status — 2026-05-11

Purpose: give the next DirectStay PlatformLead/admin heartbeat a clean handoff for the Preview Build refinement lab without rereading the full benchmark log.

## Current benchmark set

| Benchmark | Archetype | Status | Latest useful evidence | Not owner-share ready until |
| --- | --- | --- | --- | --- |
| Savannah Broughton Street carriage house | Urban / historic-district stay | Reworked internal benchmark | Dedicated hero, promotional assets removed, private-garage/walkable-city narrative, desktop/mobile QA green. | Photo rights, rates/fees/taxes, availability, occupancy, parking/pool rules, local recommendations, owner review. |
| Asheville Shope Creek cabin | Mountain / forest cabin | Reworked internal benchmark | Savannah badge bleed fixed, hero repeat fixed, Shope Creek/deck/hot-tub/group-weekend rhythm, desktop/mobile QA green. | Photo rights, exact sleeping/bath/occupancy/rules, rates/fees/taxes, availability, owner local recommendations. |
| French Escape At The Lake | Lake Norman family/group dock house | Rendered internal benchmark | Strong lake-house planning model: sleeping/layout confidence, dock/equipment questions, structure-only trip-total module, source-backed property image sequence. | Photo rights, exact sleeping layout, dock/boat/PWC/kayak/swim rules, hot-tub/event/parking/pet/accessibility policies, rates/fees/taxes, availability, cancellation terms, local recommendations. |
| Sarasota River Retreat | Gulf Coast riverfront retreat | Image-source review + constrained content plan complete; no render | Owner prose shows a distinct river/canal archetype. 2026-05-12 HTML/image inspection found one confirmed property-specific living-room image; river/pool/dock/kayak exterior art was not confirmed, and most other assets are local/stock/attraction images. 2026-05-13 content plan defines the only safe internal render path: text-forward hero, living-room trust image, and text-only river/pool/dock/kayak/firepit modules until gallery rights exist. | Full owner/gallery photo set, photo rights, safe exterior/amenity hero, water/pool/spa/kayak rules, rates/policies, owner recommendations. |

## Consolidated lessons now considered standard

1. **Image integrity before copy polish** — choose hero + first two section images from an inspected page-order inventory; reject promotional cards, text overlays, collages, review/rating graphics, OTA banners, and unknown filler.
2. **Conversion trio must read like guest planning** — calendar, price, and area-guide modules should answer property-specific guest questions before they explain DirectStay strategy.
3. **Text-only beats unsafe images** — if local/property imagery is thin, make the section intentionally text-only and record the owner photo request.
4. **Bad-copy scan must happen against rendered guest view** — remove `benchmark`, `source description`, `source material`, `final live copy`, `preview uses mock`, `strategy`, cross-property badges, and other internal/process language before scoring.
5. **Owner-share blockers stay separate from benchmark score** — a high-quality internal benchmark can still be blocked by unconfirmed rights, policies, rates, availability, taxes, and safety/local claims.

## Next safe chunks

1. **Sarasota benchmark render decision** — image-source review completed 2026-05-12 in `sarasota-river-retreat-source-audit-2026-05-10.md`; constrained internal content plan completed 2026-05-13 in `sarasota-river-retreat-preview-content-plan-2026-05-13.md`. Safe render path is text-forward or living-room-first only; do not use skyline/canal/attraction images as property hero, and do not fabricate river, wildlife, beach-distance, pool/spa, kayak, or restaurant claims.
2. **Admin prompt/schema audit** — completed 2026-05-11 in `admin-prompt-schema-audit-2026-05-11.md`. Current generator/gates cover photo-integrity prompts, Copy Review Stack, conversion-trio planning language, rendered bad-copy scan, and owner-share blocker separation.
3. **READY_FOR_REVIEW image-inventory gate** — completed 2026-05-11/12 in `directstay/src/lib/platformLeads.ts`: an approved photo/geography audit must now replace starter TODOs with `Page-order image inventory`, `Hero candidate`, `First two section-image candidates`, and `Rejected assets` before a Preview Build can move to `READY_FOR_REVIEW`. QA coverage added in `directstay/scripts/qa-preview-build-gates.mjs` and `directstay/scripts/qa-preview-build-status-gates.mts`.
4. **Benchmark index in admin UI** — completed in `/admin/preview-benchmarks` with read-audit logging and a durable QA guard (`npm run qa:preview-benchmark-index`) so future preview work starts from benchmark evidence instead of log archaeology.

## Current recommendation

The next DirectStay Preview Build refinement heartbeat can render a constrained **internal-only Sarasota benchmark** from `sarasota-river-retreat-preview-content-plan-2026-05-13.md`, or move to the next benchmark/admin UI slice. Do not create or share an owner-facing Sarasota preview until an owner/gallery photo set supports safe hero and early-section art.
