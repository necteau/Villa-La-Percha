# Preview Build Benchmark Log — 2026-05-08

Purpose: refine Preview Build quality after the Circle Home benchmark showed the safety/process foundation is solid but the sales/design execution needs sharper conversion content.

## New required conversion modules

Jaimal feedback added three required pieces for owner-worthy previews:

1. **Calendar/date-selection mock near inquiry**
   - Calendar is central to the inquiry process.
   - Preview should show how guests choose a stay window before writing.
   - Must remain read-only/non-functional until launch approval.

2. **Price comparison / savings mock**
   - Show potential guest savings from direct booking.
   - Include owner-only calculation notes: direct rate, fees, taxes, marketplace/service-fee assumptions, and potential savings.
   - Never claim guaranteed savings/best rate unless approved data supports it.

3. **Area guide / micro-destination content**
   - Preview must sell the stay and the destination, not just the house.
   - Include things to do, restaurants/coffee, beach/trail/access notes, rainy-day options, and guest-profile-specific local guidance.
   - Mark exact distances, walkability, pet rules, and recommendations for owner confirmation unless reliably sourced.

## Circle Home benchmark update

Preview URL: `https://directstay.app/p/circle-home-carolina-beach-preview?view=guest`

Added sections to the saved Preview Build:

- `calendarMock` — read-only availability/date-selection concept near inquiry path.
- `priceComparison` — illustrative direct-vs-marketplace savings mock with owner calculation note.
- `areaGuide` — Carolina Beach local guide plan covering beach/boardwalk, food/coffee, things to do, and pet-aware planning if owner confirms.

Renderer support added:

- `data-preview-calendar-mock="true"`
- `data-preview-price-comparison-mock="true"`
- QA now checks that both mocks exist in the Preview Build route.

## Initial process lessons

- A preview without calendar/price/local modules feels like a brand mood board rather than a booking/inquiry system.
- Guest-facing pages need more practical modules above the form: dates, economics, local confidence.
- Owner notes should explain the commercial logic without exposing unsupported calculations in guest view.
- Area guides need micro-geography. “Carolina Beach” is not enough; the preview should speak to the boardwalk/beach access/food/activity pattern once confirmed.

## QA evidence

- `npm run qa:preview-builds` ✅ 36/36
- `npm run lint -- --max-warnings=0` ✅
- `npm run build` ✅

## Next benchmark pass

Run 2–3 additional property-type benchmarks and score whether each conversion trio feels natural:

- mountain/cabin or lake retreat: calendar + seasonal availability + adventure/local guide + rate/fee comparison.
- urban/neighborhood stay: calendar + event/weekend framing + restaurant/walkability guide + direct savings.
- family beach/lake house: calendar + weekly-stay blocks + activities/restaurants + direct-vs-marketplace savings.

## Benchmark property candidates queued

These are research candidates for the next pass. Do not owner-share; use only as internal quality tests.

### 1. Asheville / Shope Creek modern cabin

- Source: `https://www.airbnb.com/rooms/5124601`
- Public title from fetched page title: “Modern Cabin with Hot Tub | Sauna | Creek I Garden - Cabins for Rent in Asheville, North Carolina, United States.”
- Search snippet context: Shope Creek / east Asheville, wooded creek-side property, 22 acres, multiple cabins nearby, renovated 4-bedroom log cabin, hot tub.
- Preview-test focus:
  - Calendar: seasonal mountain-weekend demand, minimum-stay framing, check-in confidence.
  - Price comparison: direct-vs-marketplace for long weekend / 4-night mountain stay, fees clearly mocked.
  - Area guide: Blue Ridge Parkway, hiking/waterfall day trips, Asheville breweries/restaurants, Biltmore/rainy-day options, grocery/arrival logistics.
- Likely design direction: warm wood, creek/forest greens, sauna/hot-tub evening mood, less airy coastal spacing than Circle Home.
- Risk notes: exact location, cabin count, bedroom/bath/sleeps, distances, and restaurant recommendations require source/owner confirmation before owner-facing use.

### 2. Savannah Historic District carriage house

- Source: `https://www.airbnb.com/rooms/48400317`
- Public title from fetched page title: “Lovely Carriage House In the Middle of Downtown! - Houses for Rent in Savannah, Georgia, United States.”
- Search snippet context: Broughton Street Carriage House, east side of the north Historic District, a few blocks south of the Savannah River, small-group stay.
- Preview-test focus:
  - Calendar: weekend/event/date-window inquiry, arrival/departure clarity, parking/access confirmation.
  - Price comparison: direct booking savings for high-demand weekends without claiming guaranteed best rate.
  - Area guide: Broughton Street, Savannah River, historic squares, Forsyth Park/day routes, coffee/cocktail/restaurant categories.
- Likely design direction: editorial historic-city stay, brick/iron/cream/green palette, denser neighborhood-forward copy than a beach house.
- Risk notes: exact walk times, parking availability, landmark proximity, and restaurant recommendations require source/owner confirmation.

### 3. Lake Norman family dock house

- Source candidate: public OTA or owner-site lakefront listing with dock/boating photos; use only if the source page is accessible without login and enough images/details are visible.
- Public context to verify before use: Lake Norman, North Carolina; private or community dock access; family/group stay; likely drive-to restaurants, marinas, groceries, and rainy-day Charlotte-region options.
- Preview-test focus:
  - Calendar: weekly summer blocks, holiday/weekend demand, check-in/out day expectations, boat-season versus shoulder-season framing.
  - Price comparison: family/group direct-stay economics over a 5–7 night stay, with cleaning/boat/pet/pool/heating fees clearly separated if they exist.
  - Area guide: boating/dock rhythm, marinas, waterfront restaurants, grocery arrival logistics, rainy-day activities, family safety notes, and owner-confirmed lake-access rules.
- Likely design direction: relaxed lake-house horizontal rhythm, freshwater blues/greens, dock wood, golden-hour family gathering cues, more practical planning modules than a luxury villa.
- Risk notes: exact dock rights, boat/PWC rules, swim safety, HOA/community rules, parking limits, pet policy, and water-depth claims require owner/source confirmation before owner-facing use.

## Benchmark scoring template

Use the same lightweight scorecard for each candidate so lessons are comparable:

| Dimension | Score 1–5 | Evidence to capture |
| --- | ---: | --- |
| Property-specific design fingerprint |  | Palette/layout/copy choices tied to visible photos and micro-location. |
| Calendar/date module fit |  | Dates, stay length, seasonality, and inquiry context feel natural for this property type. |
| Price/savings module safety |  | Assumptions are labeled; no unsupported “best rate” or guaranteed-savings language. |
| Area-guide usefulness |  | Local guidance is specific enough to prove DirectStay value, with confirmation gaps marked. |
| Owner-callout clarity |  | Owner can see what is strategy, what is draft, and what needs correction/approval. |
| Generic-template risk |  | Anything that could appear unchanged on a different property is identified and revised. |

Exit criteria for this benchmark batch: each property gets a score, recurring weaknesses are summarized, and at least one concrete playbook/design-seed/admin-prompt change is made from the evidence.

## Copy-review correction from Jaimal feedback

Jaimal reviewed the Circle Home benchmark and flagged that several paragraphs sounded AI-generated and some content felt not applicable to what should appear on a vacation-rental site. Treat this as a benchmark failure mode, not a one-off copy-edit.

New rule for the next benchmark pass: every Preview Build must run a layered copy review before scoring or sharing internally:

1. **Source-truth pass** — keep only observed/source-backed facts, owner-confirmed facts, or clearly labeled assumptions.
2. **VRBO-owner relevance pass** — copy must help a rental owner sell the stay, reduce guest friction, explain direct-booking value, or collect owner corrections.
3. **Guest usefulness pass** — public sections should answer guest questions: why this stay, what arrival feels like, how beach/lake/town access works, parking/pets/logistics, local planning, and how to inquire.
4. **Anti-AI voice pass** — remove generic phrases and strategy-memo language. If a paragraph could fit another property with the name swapped, rewrite it or delete it.
5. **Section-fit pass** — move DirectStay strategy/process notes into owner callouts/artifacts; keep guest-facing pages guest-useful.

Circle Home copy issues to fix in future benchmark/control examples:

- “turn that first impression into a memorable property story” sounds like internal positioning, not guest copy.
- “lower-friction stay than a generic search result can communicate” is DirectStay strategy language; move to owner callout.
- “clean visual identity beyond the marketplace listing” belongs in owner-facing notes, not the guest page.
- Calendar/price modules currently explain product strategy more than guest value; rewrite them as plain guest/owner-visible planning modules.
- Local guide should name only source-backed or owner-confirmed places/routes; otherwise use confirmation-needed placeholders rather than sounding authoritative.

Scoring implication: Copy quality cannot score above 3 if guest-facing copy contains obvious AI filler, internal strategy language, or claims that feel irrelevant to a VRBO/Airbnb direct-booking page.

Follow-up correction: source review must include any owner/manager-written listing description paragraphs. The Circle Home first pass over-weighted title/photo evidence and under-used the actual Airbnb prose describing the home. Future previews must extract that prose into notes, use it as inspiration for original copy, and preserve the property story/layout/guest rhythm without copying text verbatim.

## Benchmark run started — Asheville Shope Creek cabin

- Source: `https://www.airbnb.com/rooms/5124601`
- Preview URL: `https://directstay.app/p/asheville-shope-creek-cabin-preview-575528?view=guest`
- Internal lead ID: `pl-asheville-cabin-test-575528`
- Internal preview ID: `pb-asheville-cabin-test-575528`
- Source-description extraction succeeded. The Airbnb prose includes: 22 wooded creek-side acres in Shope Creek/east Asheville; renovated four-bedroom log cabin; 2.5 baths; hot tub; 900 sq ft deck with covered dining; mountain views; two wood-burning fireplaces; primary king suite; three queen bedrooms; kitchen/living/dining/sitting areas; washer/dryer; no pets; inconsistent cell service with phone provided; shared gardens, creekside sauna, chicken coop, pavilion, fire pits, and private trails.
- Generated benchmark Preview Build with calendar mock, price comparison mock, Asheville/Shope Creek area guide, owner callouts, source/fact/register artifacts, and rubric review.
- Live fetch returned 200 and exposed guest copy. First fetch caught some process/meta language in public sections, so a second copy polish removed the worst benchmark/source-review phrasing while preserving source-inspired details.
- Initial score: design fingerprint 4, calendar fit 4, price safety 4, area-guide usefulness 4, owner-callout clarity 4, generic-template risk 3. Next improvement: visual QA and tighter photo ordering/local-guide specificity.

## Benchmark run started — Savannah Broughton Street carriage house

- Source: `https://www.airbnb.com/rooms/48400317`
- Preview URL: `https://directstay.app/p/savannah-carriage-house-preview-7feeba?view=guest`
- Source-description extraction succeeded. The Airbnb prose includes: north Historic District/Broughton Street positioning; a few blocks south of Savannah River; one queen bedroom; one full bathroom; sleeper sofa; full kitchen with stainless appliances/counter space; private garage parking; Tybee/coastal island day-trip framing; heated resort-style pool access schedule; Savannah squares/Forsyth/Poinst-of-interest itinerary language; self check-in/keypad amenity.
- Generated benchmark Preview Build with calendar mock, price comparison mock, Savannah area guide, owner callouts, source/fact/design/rubric artifacts.
- Live fetch returned 200 and shows source-inspired guest copy. Initial score: design fingerprint 4, calendar fit 4, price safety 4, area-guide usefulness 4, owner-callout clarity 4, generic-template risk 3. Next improvement: remove any remaining “source description” phrasing from guest view and improve visual/photo ordering after browser QA.

## Benchmark synthesis — Asheville + Savannah design-seed corrections

Two additional property-type benchmarks now point to the same recurring weakness: the Preview Build packet can satisfy the required modules while still letting conversion sections sound like DirectStay process notes instead of guest planning.

Recurring findings:

- **Calendar/date modules:** strongest when written in property-type language: mountain long weekends/seasonal blocks for Asheville; event/weekend arrival and parking context for Savannah.
- **Price/savings modules:** safest when tied to a sample stay pattern and owner-visible assumptions; avoid broad "save by booking direct" claims unless rates/fees/taxes are approved.
- **Area guides:** strongest when organized as guest routes or stay rhythms, not generic attraction lists. Asheville needs trail/town/grocery/rainy-day planning; Savannah needs first-night walk, coffee/landmark/square routes, parking/access, and day-trip framing.
- **Copy risk:** both benchmarks need a final guest-view scrub for internal phrases ("source description," "benchmark," process language) before any Jaimal review.

Concrete playbook/design-seed changes made from this evidence:

- Updated `design-seeds/mountain-cabin.DESIGN.md` with benchmark-specific calendar, price, area-guide, and shared-amenity guidance from the Asheville Shope Creek run.
- Updated `design-seeds/urban-neighborhood-stay.DESIGN.md` with event/weekend calendar framing, conservative city-stay savings guidance, itinerary-based local guide guidance, and Savannah copy watchouts.

Next benchmark chunk: run visual/mobile QA for Asheville and Savannah, then add a Lake Norman family dock-house benchmark if an accessible public listing source is available without login.

## Lake Norman family dock-house benchmark prep — 2026-05-08 17:00 ET

Prepared the third property-type benchmark setup without creating an owner-facing preview or sending anything externally.

- Research note: `directstay/platform-leads/lake-norman-benchmark-research-2026-05-08.md`
- Candidate source: `https://www.airbnb.com/rooms/733281380793637704`
- Public title from fetched page title: “Spacious Family Lakefront Gem: Dock - Game Room! - Houses for Rent in Denver, North Carolina, United States.”
- Search snippet context: Lake Norman lakefront family retreat, private dock, fishing/kayak/paddleboard, indoor/outdoor lake-view dining, keypad self check-in.
- Fetch result: Airbnb returned HTTP 200, but readable extraction exposed only shell/navigation plus title, so this is a benchmark-prep candidate, not enough evidence for an owner-shareable preview.

Useful benchmark angle:

- calendar: summer-week/holiday/date-window planning with party size, children, and dock/water-equipment questions;
- price comparison: 5–7 night family trip-total clarity with cleaning/tax/platform/equipment assumptions separated;
- area guide: dock/boating rhythm, grocery/arrival logistics, waterfront restaurants/marinas, rainy-day Charlotte/Lake Norman backup plans;
- safety/copy watchout: water access, dock rights, boat/PWC/swim rules, equipment availability, pets, parking, HOA/noise, exact distances, and rates all need source/owner confirmation.

Recommended next action: run browser/image-source review or richer listing extraction for this candidate. If the page does not expose enough safe property images/details without login, pick another Lake Norman listing before generating a benchmark preview.

### Lake-family seed correction from prep evidence

Updated `design-seeds/lake-family-house.DESIGN.md` so future lake/family Preview Builds have concrete guidance before a full Lake Norman preview is generated:

- first-screen image rhythm must avoid repeating the same dock/lake shot across hero and early sections;
- calendar module should use summer-week / holiday-weekend / dock-equipment inquiry language;
- price module should use 5–7 night family trip-total clarity with cleaning/tax/platform/equipment assumptions separated;
- area guide should be organized around lake-day, arrival/grocery/parking, waterfront dining/marina, rainy-day, and safety/rules routes;
- photo-integrity gate calls out lake-specific risks: drone shots, promotional cards, attraction graphics, repeated sunsets, and thin rights-safe local imagery.

## Image-quality feedback — 2026-05-08 14:24 ET

Jaimal flagged three Preview Build image issues that are now hard rules for future builds:

- Do not reuse the same or near-duplicate picture in the hero / first two sections unless the source gallery is genuinely thin and the exception is documented.
- Inspect selected photos manually/visually before use; reject promotional cards, review graphics, text overlays, collages, OTA marketing banners, and anything that is not clearly the property, property view, or relevant local context.
- Do not leave bottom-of-page missing-image/placeholder gaps; either use a trustworthy distinct image or make the section intentionally text-only and record the photo gap.

Savannah benchmark audit finding: current selected image set includes at least two non-property/promotional assets from Airbnb source images, and several interiors are same-room/near-duplicate. Treat Savannah as rework before using as benchmark or owner-share reference.

## Photo-integrity rework checklist — Savannah benchmark

Use this before the Savannah carriage-house benchmark is cited as a quality example or moved toward Jaimal review:

1. **Inventory every rendered image**
   - Capture the hero image and each section image in page order.
   - Label each as `property exterior`, `property interior`, `property amenity`, `local context`, `promotional/non-property`, `duplicate/near-duplicate`, or `unknown`.
   - Reject anything with text overlays, OTA promotional graphics, review/rating cards, collages, or assets that cannot be tied to the property or legitimate local context.
2. **Choose a distinct first-screen sequence**
   - Hero: the strongest actual property or neighborhood-positioning image.
   - First content section: a different image type than the hero, ideally interior if hero is exterior/neighborhood or vice versa.
   - Second content section: a practical confidence image such as kitchen, bedroom, parking/garage, pool access, or street/context — not another same-room angle.
3. **Limit same-room repetition**
   - If multiple photos show the same room/angle, keep the clearest one and move the rest out of the main page flow.
   - Use duplicates only when a section needs that exact detail, and record the reason.
4. **Prefer text-only over unsafe filler**
   - If the source gallery does not support a section image, make the section intentionally text-only.
   - Record the gap as an owner input/photo request instead of filling with a promotional or unrelated asset.
5. **Re-score visual and technical categories after the swap**
   - Visual fit to photos/location cannot exceed 3 while promotional/non-property assets remain in rendered page sections.
   - Technical polish cannot exceed 3 while bottom-page placeholders, broken images, or unexplained repeated images remain.

This checklist is now the standard photo-integrity gate for any Preview Build benchmark rework, not only Savannah.

## Savannah Broughton Street carriage house — rework pass (2026-05-08)

Source: https://www.airbnb.com/rooms/48400317  
Preview: https://directstay.app/p/savannah-carriage-house-preview-7feeba?view=guest

Jaimal requested the Savannah benchmark be rerun through the stricter Preview Build process after the first pass selected/ordered photos poorly. Rework completed against Preview Build ID `pb-savannah-carriage-test-7feeba` / lead `pl-savannah-carriage-test-7feeba`.

### What changed

- Added renderer support for a `heroImage` / `heroOnly` section so the hero can use a dedicated image without repeating as the first visible section.
- Rebuilt the Savannah sections around a guest-facing Historic District stay narrative: private garage parking, walkable Broughton Street, compact carriage-house layout, courtyard reset, kitchen/bathroom confidence, date-aware inquiry, and trip-total clarity.
- Removed/rejected the weak visual assets from guest-facing section art:
  - Pool promotional/text-banner image.
  - Review/marketing collage.
  - Host/profile image.
  - Repeated same-room filler.
- New rendered visual order:
  1. Exterior/garage-lane hero.
  2. Open living/dining/kitchen/bedroom layout.
  3. Queen bedroom.
  4. Courtyard/outdoor reset.
  5. Kitchen/dining/washer-dryer.
  6. Calendar sample, intentionally text/read-only.
  7. Price comparison sample, intentionally text/read-only.
  8. Area guide, intentionally text because no owner-approved local imagery is available.
  9. Bathroom.
- Rewrote the guest-facing copy once more after screenshot QA caught internal/process language.
- Added/updated rework artifacts in the PlatformLead artifact table:
  - `PREVIEW_PHOTO_GEO_AUDIT`
  - `PREVIEW_DESIGN_BRIEF`
  - `PREVIEW_RUBRIC_REVIEW`

### QA evidence

- `npm run qa:preview-builds`: 38/38 checks passed.
- `npm run lint -- --max-warnings=0`: passed.
- `npm run build`: passed locally.
- Production deploys completed and aliased to `https://directstay.app`.
- Live guest page checks:
  - HTTP 200.
  - `noindex, nofollow` present.
  - Visible sections: `imageStory`, `propertyDetails`, `signatureMoments`, `amenitiesConfidence`, `calendarMock`, `priceComparison`, `areaGuide`, `directBookingValue`.
  - Disabled inquiry marker present.
  - Calendar and price comparison mocks present.
  - Owner callouts hidden in guest view.
- Screenshots captured:
  - `qa/browser-sweeps/savannah-preview-rework-final-2026-05-08-desktop.png`
  - `qa/browser-sweeps/savannah-preview-rework-final-2026-05-08-mobile.png`

### After score

- Property-specific design fingerprint: **4** — stronger Broughton Street/private-garage/city-itinerary positioning.
- Visual fit to photos/location: **4** — promotional/card assets removed; hero and early sections are distinct; remaining limitation is no clean owner-approved pool/local imagery.
- Calendar/date module fit: **4** — event-weekend/date-aware framing fits Savannah urban stay; still sample-only.
- Price/savings module safety: **4** — useful trip-total comparison, clearly illustrative.
- Area-guide usefulness: **4** — itinerary-style Savannah guide; needs owner favorites/exact walking guidance.
- Owner-callout clarity: **4** — owner-facing notes are in internal artifacts/callouts, hidden from guest view.
- Generic-template risk: **3.5** — materially improved, still constrained by generic renderer styling and limited source imagery.
- Technical polish: **4** — hero repeat fixed, no missing image placeholders, mobile/desktop render cleanly.

### Verdict

The rerun worked. The preview is now materially better: image order is coherent, obvious bad assets are gone, the page feels property-aware instead of generic, and the copy is mostly guest-facing instead of internal process notes. It is suitable for Jaimal/internal review as a stronger benchmark output. It is **not owner-share/launch-ready** until photo rights, rates/fees/taxes, availability, occupancy, parking details, pool rules, and owner local recommendations are confirmed.

## Asheville Shope Creek cabin — rework pass (2026-05-08)

Source: https://www.airbnb.com/rooms/5124601  
Preview: https://directstay.app/p/asheville-shope-creek-cabin-preview-575528?view=guest

Jaimal approved using Asheville as the next internal benchmark after the Savannah rework. Rework completed against Preview Build ID `pb-asheville-cabin-test-575528` / lead `pl-asheville-cabin-test-575528`.

### What changed

- Added custom guest badge support to the preview renderer so property-specific badge text can come from a dedicated `heroImage` / `heroOnly` section instead of hardcoded Savannah labels.
- Fixed visible metadata bleed: removed the incorrect `Historic District stay` / `Private parking focus` guest badges from Asheville.
- Added a dedicated hidden hero image section with Asheville-specific badges:
  - `Shope Creek cabin`
  - `Deck + hot tub rhythm`
  - `Group mountain weekends`
- Rebuilt the guest-facing sections around a mountain-cabin trip rhythm: Shope Creek setting, group gathering spaces, deck/hot-tub evenings, trails/town planning, arrival logistics, and trip-total context.
- Reduced guest-visible internal/process phrasing after browser/screenshot QA flagged `benchmark`, `source description`, `final live copy`, and `preview uses mock` language.
- Updated rework artifacts in the PlatformLead artifact table:
  - `PREVIEW_PHOTO_GEO_AUDIT`
  - `PREVIEW_DESIGN_BRIEF`
  - `PREVIEW_RUBRIC_REVIEW`

### Visual inventory after rework

1. Hero aerial/exterior/property setting — dedicated hero only.
2. Opening story — warm log-cabin living/gathering space.
3. Property details — deck/outdoor dining image moved earlier because deck/hot-tub rhythm is a core conversion hook.
4. Stay rhythm — wooded Shope Creek setting.
5. Location guide — intentionally text-only; no unsafe local stock/photo filler.
6. Calendar sample — intentionally text/read-only.
7. Price comparison sample — intentionally text/read-only.
8. Area guide — intentionally text-only until owner-approved local imagery exists.
9. Direct-booking value — rustic cabin detail image.

Rejected/avoided:

- Repeating the hero aerial as the first visible section.
- Repeating living-room imagery late in the page without adding new information.
- Savannah/city badge bleed.
- Promotional or non-property filler imagery.

### QA evidence

- `npm run qa:preview-builds`: 38/38 checks passed.
- `npm run lint -- --max-warnings=0`: passed.
- `npm run build`: passed locally.
- Production deploy completed and aliased to `https://directstay.app`.
- Live guest page checks:
  - HTTP 200.
  - `noindex, nofollow` present.
  - Visible sections: `imageStory`, `propertyDetails`, `signatureMoments`, `locationGuide`, `calendarMock`, `priceComparison`, `areaGuide`, `directBookingValue`.
  - Disabled inquiry marker present.
  - Calendar and price comparison samples present.
  - Owner callouts hidden in guest view.
  - Bad-copy scan after polish did not find: `Historic District stay`, `Private parking focus`, `source description`, `source material`, `hero Image`, `final live copy`, `preview uses mock`, or `benchmark`.
- Screenshots captured:
  - `qa/browser-sweeps/asheville-preview-rework-polished-2026-05-08-desktop.png`
  - `qa/browser-sweeps/asheville-preview-rework-polished-2026-05-08-mobile.png`

### After score

- Property-specific design fingerprint: **4** — stronger Shope Creek/cabin/deck-hot-tub/group-weekend positioning.
- Visual fit to photos/location: **4** — hero repeat fixed and early sequence now supports setting → gathering → deck → woods; limited distinct source imagery remains the ceiling.
- Calendar/date module fit: **4** — fall color, hiking, holiday, shoulder-season, and group-window framing fits mountain cabin behavior.
- Price/savings module safety: **4** — full-trip-total framing; sample numbers remain illustrative.
- Area-guide usefulness: **4** — trail/town/on-property categories fit guest planning; needs owner favorites and exact distances.
- Owner-callout clarity: **4** — rework notes and launch blockers captured internally and hidden from guest view.
- Generic-template risk: **3.5** — materially improved; renderer styling, placeholder calendar, and limited image variety remain constraints.
- Technical polish: **4** — custom badges, dedicated hero, no missing placeholders, mobile/desktop render cleanly.

### Remaining blockers before owner-share/launch

- Photo rights and more varied owner-approved imagery: bedrooms, bathrooms, kitchen, hot tub close-up, creek, arrival/parking, and shared amenities.
- Exact bed setup, occupancy, bathroom details, no-pets rule, hot-tub/fireplace rules, shared vs private amenities, cell-service/phone note, road/parking access, rates, fees, taxes, availability, cancellation/payment terms, and local recommendations.
- Calendar sample currently renders placeholder days through 35; acceptable for internal Preview Build, not a launch booking control.
- Price module needs real assumptions or removal before any public launch.

### Verdict

The Asheville rerun worked. It now feels materially more Shope Creek/cabin-specific, the Savannah badge bleed is gone, the repeated hero/body image issue is fixed, and the copy is more useful for guest planning. It remains an **internal benchmark Preview Build**, not owner-share/launch-ready, because factual details, photo rights, rates, rules, and richer property imagery still need owner confirmation.

## Heartbeat synthesis — 2026-05-09 11:00 ET

No owner-facing messages, production deploys, or live data changes were made in this heartbeat. Pending PlatformLead recovery returned an empty queue, so the safe DirectStay chunk was consolidating the benchmark next step after the completed Savannah and Asheville reworks.

Current benchmark evidence supports three prompt/playbook requirements for the next Preview Build generation pass:

1. **Rendered image plan first** — require a page-order image inventory before copy polish: hero, first two visible sections, all later section art, text-only sections, rejected assets, and thin-gallery exceptions.
2. **Guest-copy scrub before scoring** — require a bad-copy scan against the live guest view, not only stored artifacts, for `benchmark`, `source description`, `source material`, `final live copy`, `preview uses mock`, `strategy`, and cross-property badge/copy bleed.
3. **Conversion trio as guest planning** — calendar, price, and area-guide modules must use stay-type language first, with DirectStay/product rationale moved into owner-only notes or artifacts.

Safe next DirectStay chunk: complete the Lake Norman family dock-house benchmark only after richer source/photo evidence is available without login. If the current Airbnb candidate still exposes only title/shell content, pick a different public listing rather than fabricating dock, water-equipment, safety, pet, parking, or local-distance claims.

## Heartbeat source update — 2026-05-09 15:00 ET

Public search/fetch found a stronger Lake Norman benchmark candidate with readable source content: `https://www.frenchescapeatthelake.com/` (French Escape At The Lake). The property site describes a Lake Norman lakefront rental with private dock, hot tub, kayaks, direct water access, fire pit near the dock, boat/Jet Ski dock use, screened patio, game room, movie/theater setup, two kitchens, 4 bedrooms, 3 bathrooms, and sleeps up to 12.

This unblocks the text/source-truth side of the Lake Norman benchmark, but not the image-integrity gate. Do **not** generate/share an owner-facing preview from this alone. Next safe step: browser/image-source review or asset inventory for this candidate, then an internal-only benchmark Preview Build if hero + first two visible content sections can be supported by distinct actual-property images.
