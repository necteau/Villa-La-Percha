# Lake Norman Family Dock-House Benchmark Research — 2026-05-08

Purpose: prepare the third Preview Build benchmark type requested in `preview-build-benchmark-log-2026-05-08.md` without creating an owner-facing preview or taking external action.

## Candidate selected for benchmark prep

- Source: `https://www.airbnb.com/rooms/733281380793637704`
- Public title from fetched page title: “Spacious Family Lakefront Gem: Dock - Game Room! - Houses for Rent in Denver, North Carolina, United States.”
- Search snippet context: family-friendly Lake Norman lakefront retreat; private dock; fish/kayak/paddleboard from dock; indoor/outdoor dining with lake views; self check-in/keypad.
- Fetch status: Airbnb URL returned HTTP 200, but readable extraction only exposed shell navigation and page title. Treat snippet details as search-result evidence only until a richer listing extraction/browser review is available.

## Why this is a useful third benchmark

This fills the remaining family beach/lake-house slot after the Asheville mountain cabin and Savannah urban carriage-house runs. It exercises a different conversion pattern:

- group/family stay planning rather than couple/city or cabin-weekend planning;
- lake/dock/safety/rules complexity;
- longer 5–7 night stay economics;
- summer/holiday calendar framing;
- owner-confirmation-heavy local and amenity claims.

## Source-truth notes

Observed or publicly surfaced evidence:

- Lake Norman / Denver, North Carolina location.
- Lakefront house positioning.
- Dock and game-room title language.
- Search snippet mentions private dock, fishing, kayak/paddleboard use, indoor/outdoor dining with lake views, and keypad self check-in.

Needs confirmation before any owner-share or guest-facing confident claim:

- exact water access rights and whether the dock is private/shared;
- boat/PWC permissions, swimming rules, water depth, life-jacket availability, and guest safety responsibilities;
- kayak/paddleboard count, condition, included use, waiver/rules, and seasonal limits;
- bedroom/bath/sleeps, parking, pets, accessibility, child-safety details, and noise/HOA restrictions;
- rates, cleaning fees, taxes, platform/service-fee assumptions, security deposit, and any lake-equipment fees;
- local recommendations, marina/restaurant/grocery distances, and drive times;
- photo rights and image set quality.

## Benchmark-specific design fingerprint draft

- Property type: family lakefront house / dock retreat.
- Guest archetype: multi-generation family or friend group planning a summer lake week, long weekend, or holiday gathering.
- Emotional promise: easy lake days with a real dock rhythm — coffee by the water, kids/game-room downtime, meals inside or outside, and simple date-aware inquiry.
- Location cues: freshwater blue/green, dock wood, shoreline shade, golden-hour water, relaxed Denver/Lake Norman drive-to rhythm.
- Decor/style read: unknown until photo audit; do not assume luxury or rustic without image review.
- Signature stay moments to validate: dock launch, lake-view meals, game-room downtime, arrival/parking convenience, rainy-day Charlotte/Lake Norman backup plans.

## Conversion trio plan

### Calendar/date module

Use family-lake phrasing instead of generic availability copy:

- sample summer week and holiday-weekend date windows;
- check-in/check-out day expectations marked as owner-confirmation needed;
- party size, children, water-equipment use, and boat/dock questions collected before inquiry;
- preview-only/read-only status visible.

### Price/savings module

Use a 5–7 night family stay example, clearly illustrative:

- lodging subtotal + cleaning/owner fees + taxes;
- marketplace-style service-fee assumption separated;
- any equipment, pet, heating/pool/lake-fee assumptions explicitly excluded unless source-backed;
- guest copy focused on trip-total clarity, not guaranteed savings.

### Area guide / micro-destination module

Structure as guest planning routes, not attraction filler:

- lake day rhythm: dock, swimming/boating rules, shade, gear storage, cleanup;
- arrival logistics: grocery stop, parking, keypad/check-in, marina/ramp questions;
- food/outing categories: waterfront restaurants, marinas, coffee/breakfast, rainy-day Charlotte-region ideas;
- family safety and owner-confirmed rules prominently marked.

## Photo-integrity risks to test

- Lake listings often include drone/water shots, dock details, family/game-room interiors, sunset photos, and sometimes promotional/local cards. Only actual property, property view, or clearly relevant local-context images should render.
- Hero and first two content sections should be distinct: e.g., dock/water hero, gathering/kitchen/living interior, game room or bedroom confidence.
- If local or marina imagery is not rights-safe/source-backed, make the area guide text-only and record the owner-photo/local-confirmation gap.

## Proposed rubric focus for the Lake Norman pass

| Dimension | Target | Watchout |
| --- | --- | --- |
| Property-specific design fingerprint | 4+ | Do not make it generic “lake house blue.” Tie palette to actual photos once available. |
| Calendar/date module fit | 4+ | Must feel like lake-week/holiday planning, not a reused city/cabin date widget. |
| Price/savings module safety | 4+ | No “best rate”; equipment/cleaning/tax assumptions need owner approval. |
| Area-guide usefulness | 4+ | Needs dock/boating/grocery/rainy-day logistics, not just restaurants. |
| Owner-callout clarity | 4+ | Call out dock/safety/rules confirmation needs plainly. |
| Generic-template risk | 3.5+ | Avoid broad Lake Norman tourism copy until micro-location and owner favorites are known. |

## Recommended next action

Run a browser/image-source review or richer listing extraction for the selected Airbnb page, then create the benchmark Preview Build only if enough property images/details are accessible without login and the photo-integrity gate can be satisfied. If not, choose a different Lake Norman listing with a richer public source.

## Heartbeat source check — 2026-05-09 13:00 ET

Safe idle-work follow-up: tried to unblock the Lake Norman benchmark with public search/fetch only. No owner-facing preview was generated and no external communication was sent.

### Candidate extraction results

| Candidate | URL | Public evidence found | Fetch/readability result | Verdict |
| --- | --- | --- | --- | --- |
| Spacious Family Lakefront Gem: Dock - Game Room! | `https://www.airbnb.com/rooms/733281380793637704` | Search result/title support Denver, NC; lakefront family home; private dock; game room; indoor/outdoor lake-view dining; keypad/self check-in snippet. | HTTP 200, but readable extraction still exposed only Airbnb shell/navigation plus title. | Keep as prep candidate only; not enough property-source evidence for a full benchmark preview. |
| Lakefront Retreat w/ Dock, Hot Tub & Game Room | `https://www.airbnb.com/rooms/1653727052768861209` | Search result/title support Denver, NC; 5-bedroom Lake Norman lakefront retreat; sleeps 10; private boat dock; boating/fishing/views; hot tub; firepit; game room; multiple gathering spaces. | HTTP 200, but readable extraction exposed only Airbnb shell/navigation plus title. | Potentially stronger benchmark candidate, but still source-thin without browser/image review. |
| Boat Dock & Game Room: Waterfront Lake Norman Gem | `https://www.airbnb.com/rooms/1595009717165549469` | Search result/title support Mooresville, NC; waterfront Lake Norman; boat dock; game room; dog-friendly; Lake Norman State Park context; shore/water-play snippet. | HTTP 200, but readable extraction exposed only Airbnb shell/navigation plus title. | Backup candidate only; fetch is too thin and pet/water/dock claims need direct source verification. |

### Decision

Do **not** generate the Lake Norman benchmark from these fetches alone. Search snippets are useful for choosing a browser-review target, but the current source package lacks enough evidence for a safe property-specific image plan, source-description extraction, fact register, or guest copy. The next safe step is a visual/browser source review of the strongest candidate (`1653727052768861209`) or choosing a non-Airbnb/owner-site listing with directly readable photos and description.

### Benchmark-generation gate added for this pass

Before creating any Lake Norman Preview Build, require:

1. at least one source page with readable property description beyond title/search snippets;
2. a page-order image inventory with enough distinct actual property images for hero + first two visible content sections;
3. verified bedroom/bath/sleeps or a clear decision to omit those specifics;
4. dock/water-equipment/hot tub/pet/parking/safety details marked as observed, owner-confirmation-needed, or omitted;
5. area guide written as draft categories unless specific local recommendations are source-backed.

## Heartbeat source check — 2026-05-09 15:00 ET

Safe idle-work follow-up: searched for a stronger Lake Norman family/dock-house benchmark source with public web search and readable fetch only. No owner-facing preview was generated and no external communication was sent.

### New readable candidate found

- Candidate: **French Escape At The Lake**
- Source URL: `https://www.frenchescapeatthelake.com/`
- Fetch status: HTTP 200 with readable owner/property-site content, unlike the Airbnb-only candidates above.
- Publicly readable details from the property site:
  - Lake Norman lakefront rental with private dock, hot tub, direct water access, kayaks, and fire pit near the dock.
  - Guests may bring a boat or Jet Ski and keep it at the private dock, according to the site copy.
  - Ranch-style retreat positioned for family vacations, weekend getaways, celebrations, bachelorette/birthday groups, corporate retreats, and group trips near Charlotte.
  - Open-concept living, screened patio, game room with pool/air-hockey table, movie/theater-sound setup, two full kitchens, and multiple living areas.
  - Sleeps up to 12; 4 bedrooms; 3 full bathrooms; primary king, queen ensuite, queen bedroom, bunk + queen bedroom, and full sofa sleeper. Site notes a 275 lb max limit on bunk beds.
  - OTA links are present for Airbnb and VRBO, plus an Instagram link.

### Source-safety notes

- This is the first Lake Norman benchmark candidate with enough readable description for a source-truth pass and fact register.
- Still do **not** generate/share an owner-facing preview until image integrity is checked. The fetched text lists image captions but does not provide a page-order, rights-safe photo inventory suitable for hero/early-section selection.
- Treat boat/Jet Ski, kayak, dock, hot tub, bunk limit, sleeps, bedroom, bathroom, and group-use claims as observed from the public owner/property site, but still owner-confirmation-needed before any real owner-facing proposal.
- Local guide specifics remain weak; use draft categories unless the next pass gathers source-backed Lake Norman/Davidson/Mooresville/Denver arrival and outing details.

### Decision

Promote French Escape At The Lake as the preferred Lake Norman benchmark source candidate. The next safe step is a browser/image-source review or site asset inventory for this candidate, then a non-shared internal benchmark Preview Build if the photo-integrity gate passes.

## Heartbeat image-source inventory — 2026-05-09 17:00 ET

Safe idle-work follow-up: ran a public site asset inventory for French Escape At The Lake. No owner-facing preview was generated, no external communication was sent, and no production/DB changes were made.

### Asset extraction result

- Source URL: `https://www.frenchescapeatthelake.com/`
- Fetch status: HTTP 200.
- HTML asset scan found **56 rendered `<img>` tags** and a larger set of Wix media URLs.
- Non-property / reject assets present and should not be used as Preview Build section art:
  - social icons: Instagram, Facebook, Twitter, LinkedIn, YouTube, TikTok;
  - OTA/logo assets: `air-bnb-hti-single.jpg`, `HomeAwayVrbo-integration_logo.png`, `superhost.png`;
  - any tiny/blurred/icon-sized amenity thumbnails where the original property image cannot be confidently inspected.

### Usable property-image candidates from public source

The source appears to expose enough distinct property imagery to support an internal-only Lake Norman benchmark **after visual inspection/screenshot QA**. Candidate image categories visible from filenames/alt text include:

1. **Hero / lake setting**
   - large lake/property hero candidate: `1059de_a0b6de3bdad94ffd96d50067c98c9ab7f000.jpg` (large 1687x809/1920x921 variants, blank alt).
   - `Lake at Night from Deck`.
2. **Water/dock/outdoor rhythm**
   - `Private Dock`.
   - `Outdoor Seating`.
   - `Hot Tub` / `Hot Tub 01.heic`.
   - `fire pit 2.HEIC`.
   - `Outdoor Grill`.
3. **Interior/gathering confidence**
   - `french escape at the lake family room`.
   - `french escape at the lake basement family room`.
   - `Chef's Kitchen`, `Kitchen with Bar`, `2nd kitchen.jpeg`.
   - `Dining`, `Dining 2`.
4. **Bedroom/bathroom confidence**
   - Primary king, queen ensuite, Bedroom 3 queen, Jack-and-Jill bedrooms, bunk + queen bedroom, primary/ensuite showers, full sofa sleeper.
5. **Potentially external/non-property caution**
   - `Boat Rental` may be a local/service image rather than a property image; use only if visual QA proves it is relevant local context and not promotional filler.

### Preliminary image plan for an internal benchmark

If the next run generates the non-shared benchmark, start with this page-order plan and verify visually before rendering:

1. Hero: lake/property setting from the large hero image, if visual QA confirms it is the actual property or property view.
2. First visible story section: family room or main kitchen/open living image — not another water/dock shot.
3. Second visible content section: dock/hot tub/fire pit image — distinct outdoor stay rhythm.
4. Practical confidence section: bedrooms/bathrooms or second kitchen, depending on which source images are clearest.
5. Calendar, price comparison, and area guide: text/read-only unless source-safe images add guest value.
6. Direct-booking value: screened patio/dining/indoor-outdoor image if visually clean and non-duplicative.

### Benchmark gate status

French Escape now passes the **source-description** gate and appears likely to pass the **hero + first two distinct actual-property images** gate, but it still needs visual QA before a benchmark Preview Build is created. Do not use OTA logos, superhost badges, social icons, promotional/service cards, or tiny blurred thumbnails as guest-facing section art. Treat all dock/boat/PWC/kayak/hot-tub/safety/rules/rates/local-distance claims as owner-confirmation-needed before any owner-share or launch path.
