# Villa La Percha Reviews Source Audit

_Date: 2026-05-05_

## Public listing sources checked

- Airbnb: `https://www.airbnb.com/rooms/20472078`
- VRBO: `https://www.vrbo.com/935749ha`
- Aggregator/reference result: HiChee listing result for Villa La Percha / Chalk Sound

## What I could verify without owner login or anti-bot bypass

- Airbnb listing is publicly discoverable as **Villa La Percha: Kayaks, Ocean Access, Pool & More**.
- VRBO listing is publicly discoverable as **Villa La Percha: Full Home with Kayaks, Ocean Access, Pool, and More!**.
- Search result snippets show a third-party/aggregator summary of approximately **4.5 rating / 13 reviews**, but the review bodies were not available through normal fetch/search results.
- Airbnb fetch returned only shell/listing chrome and no review text.
- VRBO returned a bot-check/429 page through normal fetch.
- HiChee returned a Cloudflare/403 challenge through normal fetch.

## Review text / customer images pulled

None safely pulled yet.

Reason: the review body and customer-photo details appear behind client-side rendering, anti-bot checks, or platform UI that was not accessible through normal lightweight fetch/search. I did **not** attempt aggressive bypassing or credentialed scraping.

## Compliance posture

Do not publish copied Airbnb/VRBO review text or guest-uploaded images until one of these is true:

1. Jaimal/the owner has platform-owner access and manually exports/screenshots review details for internal verification, then approves selected excerpts; or
2. The guest gives direct permission through Villa La Percha / DirectStay review intake; or
3. Counsel confirms the exact attribution/excerpt approach is acceptable under platform terms and applicable law.

Even with attribution, copied OTA reviews and guest images can create platform-TOS/copyright/right-of-publicity issues. The safest path is to use OTA reviews as source leads, then obtain direct guest permission for the exact quote/photo we publish.

## Recommended review collection system

Best path: add a first-party **Guest Review Request** flow tied to Villa La Percha customers/reservations.

### Collection options

1. **Email-only intake** — guests email `villalapercha@gmail.com`.
   - Fastest operationally.
   - Poor structure/permissions unless the email template explicitly asks for publish permission, name/location display, star rating, and photo rights.

2. **Website submission form** — guest submits rating, review, optional photos, consent checkboxes, and display name.
   - Best long-term path.
   - Needs spam protection, file upload/storage, moderation, and owner approval before publishing.

3. **Hybrid recommended** — owner sends a simple post-stay email linking to a DirectStay review form.
   - Keeps review requests personal and legitimate.
   - Produces structured, permissioned reviews.
   - Lets DirectStay store source/permission metadata and publish only approved reviews.

## Proposed data fields

- Reservation/customer link when available
- Guest name and email
- Public display name, location, stay month/year
- Rating
- Review title/body
- Favorite moments/tags
- Optional photos with captions
- Source: direct, Airbnb-imported-lead, VRBO-imported-lead, owner-entered
- Permission flags:
  - may publish review text
  - may edit for length/grammar without changing meaning
  - may publish submitted photos
  - may display first name/location/stay month
- Moderation status: pending, approved, rejected, archived
- Attribution/source note
- Internal notes/audit trail

## Public site copy rule

For OTA-sourced reviews, use labels like:

> Guest review originally left on Airbnb; republished with guest/owner permission.

or

> Guest review originally left on VRBO; republished with guest/owner permission.

Do not imply Airbnb/VRBO endorsed DirectStay or Villa La Percha.
