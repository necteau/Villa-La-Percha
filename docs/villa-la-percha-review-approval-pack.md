# Villa La Percha Review Approval Pack

Prepared: 2026-05-07

## Recommendation

Publish the review section with the two strongest Airbnb public reviews first, each paired with up to four existing Villa La Percha photos. Keep the March 2024 four-star review in the private inventory for transparency, but do not feature it on the public page unless Jaimal wants a more candid review mix.

## Approve for public page

### Candidate A — Efren, Berwyn, Illinois

- Source: Airbnb public review
- Rating/date: 5 stars · June 2022
- Stay context: Stayed a few nights
- Proposed display attribution: `Efren · Berwyn, Illinois`
- Proposed display context: `Airbnb public review · 5 stars · June 2022`
- Proposed cleaned quote:
  > The space accommodated our party of 8. Each room had a bathroom, the common spaces were inviting and comfortable, and the kitchen was fully stocked. The house was amazing — great location and amenities!
- Original pulled text:
  > The space was Accommodating to our party of 8. Each room had a bathroom, it was luxurious. The  common spaces were inviting and comfortable. The kitchen was fully stocked which made it easy for us to cook anything we wanted. The house was amazing! Great location and amenities!
- Proposed photos:
  1. `/images/living-room-dining-entrance.jpg`
  2. `/images/kitchen.jpg`
  3. `/images/master-suite-balcony-taylor-bay.jpg`
  4. `/images/secondary-suite-balcony-ocean.jpg`

Approval:
- [ ] Approved as written
- [ ] Approved with edits
- [ ] Do not publish

### Candidate B — Maria, Atlanta, Georgia

- Source: Airbnb public review
- Rating/date: 5 stars · July 2022
- Stay context: Stayed with kids
- Proposed display attribution: `Maria · Atlanta, Georgia`
- Proposed display context: `Airbnb public review · 5 stars · July 2022`
- Proposed quote:
  > Beautiful home in the most gorgeous location! Loved it for our family vacation.
- Proposed photos:
  1. `/images/aerial-house-ocean-neighbors.jpg`
  2. `/images/pool-hot-tub-lounge-umbrellas-ocean.jpg`
  3. `/images/hot-tub-pool-ocean-sapodilla-bay.jpg`
  4. `/images/sapodilla-bay-beach.jpg`

Approval:
- [ ] Approved as written
- [ ] Approved with edits
- [ ] Do not publish

## Hold internally for now

### Candidate C — Rhett, Armonk, New York

- Source: Airbnb public review
- Rating/date: 4 stars · March 2024
- Stay context: Stayed with kids
- Recommendation: Keep internal; do not feature on homepage trust section.
- Reason: Includes criticism about oven/ice maker and repair workers. Useful as a reality check, not ideal conversion copy.
- Original pulled text:
  > Great location, nice house. Disappointed that the oven didn’t work during our stay and we had to deal with workers coming in and out to fix the oven and broken ice maker, which was a nuisance. But overall, we had a great trip.

## Suggested public trust language

Use near the reviews section:

> Airbnb currently shows a 4.67/5 rating from 3 public guest reviews for Villa La Percha, with 5.0s for cleanliness, check-in, communication, and location. Selected comments below are sourced from public booking-platform reviews and owner-approved guest correspondence.

## Post-stay testimonial request email

Subject: Thank you for staying at Villa La Percha

Hi {{firstName}},

Thank you again for choosing Villa La Percha. We hope your time in Chalk Sound was restful, easy, and full of the kind of moments that make the trip stay with you.

If you have a minute, we’d be grateful for a short note about your stay — what you loved, what made the villa work well for your group, or anything you’d tell another family considering a visit.

With your permission, we may share a brief excerpt on the Villa La Percha direct-booking site using only your first name and general location, for example: “Maria · Atlanta, Georgia.”

Replying to this email is perfect. And if you’d prefer your comments stay private, just say so — we’ll treat them as owner feedback only.

Warmly,
Villa La Percha

## Data/UX note

The current local implementation supports up to four photos per review via `photos: GuestReviewPhoto[]`; display uses `getReviewPhotos(review)` to enforce the four-photo limit.
