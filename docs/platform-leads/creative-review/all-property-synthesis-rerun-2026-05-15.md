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

## External Owner-Site Benchmark Set - 2026-05-16

- Creative review artifact: `docs/platform-leads/creative-review/owner-site-benchmark-set-2026-05-16/review.md`
- Properties reviewed: WILDPOD Tofino, Nkanyi House Hoedspruit, and The Shippen Shropshire.
- Gate result: all three passed for internal creative review because credible property photos were found for hero/early-section planning, but all remain blocked from owner-share or public DirectStay preview creation until photo rights and owner/source facts are confirmed.
- Important gate finding: Nkanyi House exposed a text-overlay feature card; the new rule correctly treats it as fact-register input, not section imagery.
- Direction winners:
  - WILDPOD: **Clayoquot Window Stay**, target **47/50**.
  - Nkanyi House: **After-Safari House Rhythm**, target **47/50**.
  - The Shippen: **Modern Barn Quiet Base**, target **44/50** because source copy is thin.
- System updates made: Preview Build playbook now requires media-role classification and object/ritual-first Creative Review framing.

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

## Surfsong Villa Rerun Result

- Prior visible PreviewBuild slug: `surfsong-villa-preview`
- Prior score: **29/50** because the legacy migration had no usable hero image and only generic large-villa copy.
- Direction scores:
  - Maho waterfront group planner: **43/50**
  - Sunset pool-deck resort rhythm: **44/50**
  - Six-bedroom logistics command center: **42/50**
- Selected base: **Sunset pool-deck resort rhythm**
- Synthesis borrow list:
  - borrow group layout and bedroom/bath clarity from the logistics direction;
  - borrow Maho/Simpson Bay arrival and beach/airport context from the waterfront planner;
  - keep pool-deck/ocean/dining imagery as the emotional spine.
- Final synthesized direction: **Waterfront Group-Stay Planner**
- Final synthesized score: **45/50**
- Final PreviewBuild slug / candidate state: `surfsong-villa-preview`, synthesized internal candidate to update in place with verified public-manager imagery.
- Remaining owner-share blockers: photo rights/owner approval, exact bed configuration, waterfront/swim/safety rules, pool/hot-tub if applicable, airport/noise context, rates/fees/taxes, minimum stay, cancellation/payment terms, and owner recommendations.

## Savannah Broughton Street Rerun Result

- Prior visible PreviewBuild slug: `savannah-carriage-house-preview-7feeba`
- Prior score: **40/50**
- Direction scores:
  - Historic-district editorial hideaway: **43/50**
  - Parking-first city logistics: **42/50**
  - Savannah weekend itinerary: **44/50**
- Selected base: **Savannah weekend itinerary**
- Synthesis borrow list:
  - borrow the editorial first screen and carriage-house mood from the historic-district direction;
  - borrow parking/access clarity from the logistics direction;
  - keep itinerary sequencing as the page spine.
- Final synthesized direction: **Broughton Street Weekend Planner**
- Final synthesized score: **46/50**
- Image gate: passed for internal preview; existing Airbnb-derived record includes distinct hero, interior/details, rhythm, and amenity images.
- Final PreviewBuild slug / candidate state: `savannah-carriage-house-preview-7feeba`, synthesized candidate to update in place.
- Remaining owner-share blockers: photo rights, owner-approved parking/access rules, event-week pricing, exact fees/taxes, house rules, cancellation/payment terms, and local recommendations.

## Asheville Shope Creek Rerun Result

- Prior visible PreviewBuild slug: `asheville-shope-creek-cabin-preview-575528`
- Prior score: **41/50**
- Direction scores:
  - Trailhead cabin field guide: **43/50**
  - Deck/hot-tub weekend rhythm: **44/50**
  - Asheville group logistics: **42/50**
- Selected base: **Deck/hot-tub weekend rhythm**
- Synthesis borrow list:
  - borrow trail/creek specificity from the field-guide direction;
  - borrow party-size, parking, bedroom, and trip-total clarity from the logistics direction;
  - keep deck/hot-tub evening rhythm as the emotional spine.
- Final synthesized direction: **Shope Creek Cabin Weekend Field Guide**
- Final synthesized score: **46/50**
- Image gate: passed for internal preview; current record has distinct exterior/deck, gathering, bedroom/layout, and hot-tub/deck images.
- Final PreviewBuild slug / candidate state: `asheville-shope-creek-cabin-preview-575528`, synthesized candidate to update in place.
- Remaining owner-share blockers: photo rights, exact trail/creek access claims, hot-tub rules, parking, pets/events, rates/fees/taxes, minimum stay, and owner local recommendations.

## French Escape at the Lake Rerun Result

- Prior visible PreviewBuild slug: `french-escape-at-the-lake-preview`
- Prior score: **43/50**
- Direction scores:
  - Warm lake-house editorial: **44/50**
  - Family logistics planner: **45/50**
  - Dock-day equipment guide: **43/50**
- Selected base: **Family logistics planner**
- Synthesis borrow list:
  - borrow the warmer first-screen mood from the editorial direction;
  - borrow dock/hot-tub/firepit/equipment specificity from the equipment-guide direction;
  - keep sleeping/gathering/date planning as the page spine.
- Final synthesized direction: **Lake Norman Group-Stay Planner**
- Final synthesized score: **47/50**
- Image gate: passed for internal preview; official owner site has hero, lake/day, bedroom, hot-tub, firepit, and local-planning imagery already reflected in the current PreviewBuild.
- Final PreviewBuild slug / candidate state: `french-escape-at-the-lake-preview`, synthesized candidate to update in place.
- Remaining owner-share blockers: photo rights, exact dock/boat/PWC/kayak/swim rules, hot-tub/firepit/parking/pet/event/accessibility policies, rates, fees, taxes, deposits, cancellation, and owner recommendations.

## Paradise Point Exuma Image Gate Result

- Current PreviewBuild state: legacy record `paradise-point-exuma-preview` has a hero image section without an image URL, so it is not a valid visible Preview Build under the new process.
- Public search found Tripadvisor evidence for Paradise Point Exuma with many photos, but fetch access did not expose clean usable image URLs.
- Gate verdict: **image-blocked**. Do not run full creative variants or promote as a visible Preview Build until usable property photos are obtained from owner, manager, or a rights-safe source.
