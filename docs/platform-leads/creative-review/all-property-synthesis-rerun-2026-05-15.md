# All-Property Preview Build Synthesis Rerun - 2026-05-15

Status: active rerun ledger. This supersedes older Preview Build attempts as current candidates without deleting evidence.

## Operating Rule

Do not physically delete prior Preview Build records, screenshots, or docs during this pass. Old work becomes archived/superseded evidence. The visible/current candidate for each property should become the synthesized final direction from the new creative-review process:

1. Three materially different creative directions.
2. 50-point scoring.
3. Strongest direction selected as the base.
4. Synthesis pass borrows the best layout, visual, copy, trust, and conversion lessons from the other directions.
5. Final synthesized direction is rescored.
6. Final synthesized direction becomes the visible Preview Build candidate.
7. Variants and scores remain linked as internal evidence.

## Image Gate

No usable photos means no real Preview Build. Before a property enters the three-direction creative review, verify that it has enough trustworthy imagery for a hero and the first two content sections. Public/OTA images can be used for research and internal mockup confidence, but owner-share promotion remains blocked until photo rights or owner approval are clear.

If a property fails this gate, keep it as `image-blocked` with a photo request/research note instead of generating weak variants.

## Inventory

Live PreviewBuild query found 17 records.

### Rerun Properties

| Property | Current / Prior State | Rerun Priority | Notes |
| --- | --- | ---: | --- |
| Circle Home / Carolina Beach | Old benchmark; Jaimal said it needed work; later received calendar, price, and area-guide modules. | 1 | Highest improvement gap. Rebuild from new process before citing as quality example. |
| Sarasota River Retreat | Creative review pilot exists; winner was planner-first utility at 43/50, but no synthesized PreviewBuild exists yet. | 2 | Convert the pilot into final synthesized Preview Build only if source-safe imagery remains text-forward/living-room-safe. |
| Savannah Broughton Street carriage house | Reworked benchmark with image/order/copy fixes; strong but still renderer-generic. | 3 | Light synthesis pass should improve historic-district visual distinctiveness. |
| Asheville Shope Creek cabin | Reworked benchmark; Shope Creek/deck/hot-tub rhythm solid after badge/image fixes. | 4 | Light synthesis pass should improve mountain-weekend visual identity. |
| French Escape at the Lake | Strong Lake Norman benchmark; source-backed image sequence and planning modules exist. | 5 | Add warmer emotional first screen and rescore. |
| Paradise Point Exuma | Migrated legacy POC into PreviewBuild. | 6 | Needs full new process; older POC likely predates current gates. |
| Surfsong Villa | Migrated legacy POC into PreviewBuild; current record had no hero image. | 7 | Image-gated. Candidate property/amenity photos found on public manager/OTA sources and visually verified, but photo rights/owner confirmation remain blockers before owner-share promotion. |
| Villa La Percha control | Internal control reference, not a replacement for the real site. | 8 | Keep as control/reference unless a new synthesized control is useful for demo parity. |

### Excluded From Property Rerun

| Record Group | Reason |
| --- | --- |
| Preview Test Links | Utility record, not a property candidate. |
| QA Harbor House records | QA/test records generated during admin/PreviewBuild gate testing. Supersede/archive from user-facing index; do not treat as real property candidates. |

## Output Summary Template

For each rerun property, record:

- prior visible PreviewBuild slug;
- old score / known weaknesses;
- three creative directions with scores;
- selected base;
- synthesis borrow list;
- final synthesized score;
- final PreviewBuild slug / candidate state;
- remaining owner-share blockers;
- Mission Control / DirectStay admin visibility check.

## Current Next Action

Start with Circle Home because it has the largest known quality gap and is the best proof that the new process improves a previously weak benchmark.

## Circle Home Rerun Result

- Creative review artifact: `docs/platform-leads/creative-review/circle-home-carolina-beach-2026-05-15/review.md`
- Prior score: **31/50**
- Direction scores:
  - Iconic Round Beach House: **41/50**
  - Family Beach Logistics: **44/50**
  - Carolina Beach Micro-Guide: **41/50**
- Selected base: **Family Beach Logistics**
- Final synthesized direction: **Round House Beach Week Planner**
- Final synthesized score: **46/50**
- PreviewBuild updated: `circle-home-carolina-beach-preview`
- Verification:
  - public route returned HTTP 200 with new title/content after DB update;
  - `npm run qa:preview-builds` passed 45/45;
  - `npm run qa:preview-benchmark-index` passed;
  - `npm run lint -- --max-warnings=0` passed.
- Renderer follow-up: fixed local hardcoded preview hero eyebrow that was leaking `Sarasota river stay` into non-Sarasota previews. This requires successful app deployment before production fetch stops showing the stale eyebrow.

## Sarasota River Retreat Rerun Result

- Source creative review artifact: `docs/platform-leads/creative-review/sarasota-river-retreat-2026-05-15/review.md`
- Prior score: **36/50**
- Direction scores:
  - Owner-direct trust: **38/50**
  - Boutique river editorial: **36/50**
  - Planner-first utility: **43/50**
- Selected base: **Planner-first utility**
- Final synthesized direction: **Planner-First River Stay**
- Final synthesized target score: **45/50**
- PreviewBuild created/updated: `sarasota-river-retreat-preview`
- Verification:
  - public route returned HTTP 200 with synthesized title/content after DB update;
  - appears in latest PreviewBuild inventory above Circle Home;
  - remains internal-only/not owner-shareable.
- Remaining blockers: full owner/gallery photo set, photo rights, safe exterior/amenity hero, water/pool/spa/kayak/firepit rules, rates/policies, cancellation/payment terms, and owner local recommendations.

## Surfsong Villa Image Gate Result

- Current PreviewBuild state: legacy record `surfsong-villa-preview` had a hero image section with no image URL, so it is not a valid visible Preview Build under the new process.
- Public source checked: Rent By Owner listing confirmed property facts and location context but did not expose clean usable image URLs through fetch.
- Public source checked: Saint Martin Rentals listing exposed candidate property images for Surfsong Villa in Beacon Hill, Sint Maarten.
- Visual verification:
  - oceanfront deck/plunge pool/loungers/turquoise water — suitable hero candidate;
  - poolside deck/swings/loungers/ocean view — suitable amenity section;
  - deck seating/swings over ocean — suitable amenity/view section;
  - covered outdoor dining beside pool/sea view — suitable amenity/dining section.
- Gate verdict: image depth is adequate for internal creative review and synthesis, but owner-share promotion remains blocked on photo rights/owner confirmation and full source fact verification.
