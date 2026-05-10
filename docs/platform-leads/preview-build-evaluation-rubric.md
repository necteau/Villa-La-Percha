# DirectStay Preview Build Evaluation Rubric

Status: working rubric. Use after every PlatformLead Preview Build and before sharing with Jaimal/owner.

## Purpose

Preview Builds are sales artifacts, but they should be judged like high-quality hospitality design work. This rubric prevents generic templates, fake specificity, weak mobile composition, and property/design mismatch.

Score each category 1–5.

- 1 = weak / generic / risky
- 3 = acceptable but not memorable
- 5 = highly personalized, polished, and owner-worthy

A Preview Build should not be owner-shared unless it averages 4+ and has no safety/fact failures.

## 1. Property understanding

Does the preview clearly understand this property?

Checklist:

- Property type is clear.
- Location/destination context is specific.
- Guest archetype is plausible.
- Hero promise fits the actual listing/photos.
- At least 5 property-specific details appear.
- Observed facts and inferred assumptions are separated.

Failure mode: hero/copy could apply to any rental.

## 2. Visual fit to photos/location

Does the design look like it belongs to the property?

Checklist:

- Palette is derived from location/photos, not generic brand colors.
- Palette notes cite specific visual evidence from the listing images or precise geography.
- Image order tells a coherent guest story.
- Hero and the first two content sections use distinct, non-near-duplicate photos unless a thin-gallery exception is documented.
- Every selected image is inspected and classified as property photo, property view, or relevant local-area context; promotional cards, review graphics, text overlays, collages, OTA marketing banners, and non-property images are rejected.
- Bottom sections do not show broken/missing-image placeholders; if no trustworthy image exists, the section is intentionally text-only and the gap is recorded.
- Interior materials/decor influence the design.
- External landscape/context influences mood.
- The design distinguishes this property from similar broad-category properties.
- Colors do not fight the photos.
- The design avoids generic SaaS blue/gray and random gradients.

Failure mode: beautiful UI that feels unrelated to the property, or one coastal/mountain/urban preview that looks interchangeable with every other property in the same broad category.

## 3. Owner/decor style interpretation

Does the preview respect the owner’s apparent taste?

Checklist:

- Decor style read is documented.
- Typography matches the style read.
- Layout density matches the property personality.
- Components feel appropriate: editorial, cozy, modern, family-friendly, luxury, etc.
- The preview does not overwrite a warm/traditional property with cold modernism or vice versa.

Failure mode: DirectStay imposes a style instead of amplifying the property.

## 4. Guest desire and trust

Would a guest feel more excited and confident?

Checklist:

- Hero creates desire.
- Amenities/practical details create confidence.
- Local guide content reduces uncertainty.
- Calendar/date-window mock makes the inquiry process feel practical and central.
- Price comparison/savings mock helps guests understand direct-booking value without unsupported guarantees.
- Guest flow answers: why here, what is it like, who is it for, how do I inquire?
- No overpromising or fake claims.

Failure mode: pretty but not persuasive.

## 5. DirectStay sales value

Would an owner see why DirectStay is different from an OTA listing?

Checklist:

- Owner callouts explain strategy without ruining the page.
- Direct-booking value is specific and human.
- Owner-visible savings calculation notes explain rate/fee/tax/platform assumptions behind any price comparison mock.
- The page shows brand-building, not just a listing clone.
- It demonstrates local knowledge/content strategy.
- It hints at how onboarding will replace assumptions with owner truth.

Failure mode: owner says “this is just another listing page.”

## 6. Copy quality

Is the writing specific, clear, non-generic, and appropriate for a vacation-rental owner’s direct-booking site?

Checklist:

- Copy Review Stack is completed: source-truth, VRBO-owner relevance, guest usefulness, anti-AI voice, and section-fit passes.
- Source-truth review includes owner/manager-written listing description paragraphs, not only title, amenities, and photos; final copy is inspired by that prose but not copied.
- No cliché travel filler or generic AI brochure language.
- Hero line is property-specific and could not be pasted onto another listing unchanged.
- Section headings have taste, but stay natural for a guest-facing rental site.
- Guest-facing paragraphs help guests plan or trust the stay; internal strategy/process copy lives in owner callouts or artifacts.
- Copy is concise but evocative; practical details are clear.
- Assumptions are marked as draft/preview where appropriate.
- Any claim about pets, parking, walkability, beach/lake/trail access, sleeping capacity, fees, rates, discounts, policies, safety, or exact distances is source-backed, owner-confirmed, or removed from guest copy.

Failure mode: AI travel brochure sludge, or “DirectStay strategy memo” paragraphs showing up on the public guest page.

## 7. Mobile composition

Does mobile feel intentionally designed?

Checklist:

- Hero crop works on mobile.
- Important context appears before excessive decoration.
- Image/gallery flow is usable.
- CTA/callout hierarchy is clear.
- Owner callouts do not overwhelm guest-facing content.

Failure mode: desktop design merely stacked into a phone trench coat.

## 8. Safety / preview constraints

No Preview Build can pass with any safety failure.

Required:

- No working booking engine.
- No live payment.
- No live inquiry submission unless launch-approved.
- Preview-only CTA is clear.
- Noindex/public-obscure URL.
- Not linked from nav/sitemap.
- No fake reviews, rates, availability, distances, policies, or claims.
- Calendar and price comparison modules are explicitly read-only/mock unless backed by approved production data.
- No copied OTA reviews, ratings, guest names, guest photos, or testimonial language without recorded permission/source rights and owner approval.
- No unsupported safety, accessibility, licensing, insurance, legal, tax, availability, cancellation, “verified,” “official,” “guaranteed,” or “best rate” claims.
- No private/sensitive owner data exposed.
- Source URLs and assumptions are recorded.
- Owner-share note explains preview-only, public-obscure/noindex, non-functional, correction, and removal status.

Owner-share gate:

A Preview Build cannot be marked owner-shareable unless:

- Jaimal/operator has reviewed the exact URL.
- Source URLs and assumptions are recorded.
- Owner-facing share note explains preview-only/noindex/public-obscure/non-functional status.
- At least one owner-view callout names assumptions that need owner correction.
- No copied OTA reviews/ratings/photos/testimonials appear without recorded permission.
- No sensitive owner data or private operational details are visible.
- Legacy and canonical routes, if both exist, are noindex and non-functional.

Automatic rework blockers:

- No stored photo/geography audit.
- No palette evidence tied to source images/location.
- No mobile QA evidence.
- Owner callouts are generic.
- Hero line could fit another property unchanged.
- Preview uses broad geography label only, such as “coastal,” “mountain,” or “urban,” without micro-location specificity.
- Fact/assumption register is missing.
- Photo/source-integrity audit is missing, or the rendered preview uses promotional cards/review graphics/text-overlay assets as property imagery.
- Share note/removal path is missing.

Benchmark promotion blockers:

- A benchmark has not been checked against the latest rendered guest page after copy/image rework.
- No page-order rendered-image inventory exists for the promoted version.
- Guest-visible copy still contains internal benchmark/process language, source-review labels, or badge/copy bleed from a different property.
- Calendar, price, or area-guide modules explain DirectStay strategy more than they help a guest plan this specific stay.
- Remaining owner-share blockers are mixed into the score instead of being called out separately.

Failure mode: sales preview accidentally becomes a production product, makes unsupported claims, or creates owner distrust because public-source/inferred content is not clearly framed as draft and correctable.

## 9. Technical polish

Checklist:

- Desktop render checked.
- Mobile render checked.
- No obvious layout breaks.
- Images are optimized and have usable alt text.
- No adjacent section image duplication, no stale placeholders, and no promotional/non-property images used as section art.
- Loading/performance is reasonable.
- No console/build errors.

Failure mode: visually promising but sloppy.

## Scoring table

```md
# Preview Build Review

Property:
Preview URL:
Reviewer:
Date:

| Category | Score 1–5 | Notes |
|---|---:|---|
| Property understanding |  |  |
| Visual fit to photos/location |  |  |
| Owner/decor style interpretation |  |  |
| Guest desire and trust |  |  |
| DirectStay sales value |  |  |
| Copy quality |  |  |
| Mobile composition |  |  |
| Safety / preview constraints | PASS/FAIL |  |
| Technical polish |  |  |

Average score:
Shareable? yes/no
Top fixes before sharing:
```

## Share threshold

- **Owner-shareable:** average 4.0+, safety pass, no major mobile/technical issues.
- **Jaimal review only:** average 3.2–3.9 or unresolved assumptions.
- **Rework:** below 3.2, generic hero, palette mismatch, unsupported claims, or mobile failure.

## Final pre-share question

Would the owner believe we built this after actually studying their property, photos, decor, and precise location, or would they think we swapped names into a template?

If the honest answer is “template,” do not share it.
