# Villa La Percha Guest Rental Agreement — Source Notes

Source reference: `Rental_Contract_Tamalita_Campbell_June_15_2024---206f32ac-05f5-4179-a8c9-b2e835f3696a.pdf`

> Internal working notes only. These notes summarize a prior Villa La Percha rental contract so the DirectStay draft can preserve real business terms without blindly copying legacy wording. Not legal advice.

## Reservation Summary Fields in Source

The legacy contract begins with a reservation summary containing:

- Property name and address: Villa La Percha, 27 Ocean Point Drive, Providenciales, Turks and Caicos Islands.
- Rental start/end dates.
- Check-in time: 4:00 PM.
- Check-out time: 10:00 AM.
- Deposit/down payment amount and due date.
- Final payment amount and due date.

## Parties / Entity Names

- Guest: named primary guest.
- Owner: Turkoise Investments LLC.
- Property: Villa La Percha.
- Prior form also references Agent and Management Company. For DirectStay, the agreement should distinguish:
  - Owner / authorized operator.
  - Guest.
  - DirectStay as software/booking workflow where appropriate, not necessarily a rental party unless Jaimal/counsel decides otherwise.
  - Local concierge/management company as service provider where relevant.

## Business Terms Captured

- Payments:
  - Down payment due on execution.
  - Down payment treated as nonrefundable unless the agreement says otherwise.
  - Late/missed payments allow cancellation and retention of payments.
  - Additional charges may be deducted from security deposit/hold; excess is immediately due.
- Security deposit / card hold:
  - Source uses a $1,500 open credit card charge if specified in the reservation summary.
  - Covers damages, breakage, missing items, long-distance calls, additional cleaning, key/gate remote replacement, A/C/electric overages, and other additional charges.
- Additional charges:
  - Damage/misuse by Guest or invitees/service providers.
  - Excess cleaning.
  - Late checkout / failure to vacate.
  - A/C/electric usage above allowance.
  - Sewer/drain blockage from improper flushing.
  - Garbage disposal damage from improper items.
  - Interior water/wind damage from failure to secure doors/windows.
  - Furniture movement or relocation is prohibited; Guest liable for loss/damage.
- Occupancy:
  - Maximum occupancy: 8 people.
  - Applies to people present at the Property at any time, not just overnight guests.
  - Parties, weddings, family reunions, or gatherings over maximum occupancy are forbidden and can trigger eviction/forfeiture.
- Cancellation:
  - For non-holiday period, cancellation allowed with written notice at least 90 days before arrival and 25% cancellation fee.
  - Otherwise non-cancelable/nonrefundable; guest remains responsible for full rental amount and enforcement costs.
  - Strongly encourages travel insurance.
  - Owner/agent may cancel if property is sold, unavailable, out of order, or substandard; remedy is transfer to similar/better property if possible or refund of payments, without other liability.
  - Source excludes December 18–January 2 from ordinary cancellation rule.
- Check-in/check-out:
  - Check-in 4:00 PM; check-out 10:00 AM unless concierge grants exception.
  - Holdover/failure to vacate: additional rent at 3x applicable daily rate plus costs/damages.
- Guest obligations:
  - Follow posted/communicated rules.
  - Comply with laws and respect neighbors.
  - No loud music, live music, shouting, profanity.
  - No over-occupancy parties/events.
  - Responsible for invitees.
  - Guest must provide true/complete information and share agreement/content with party.
- Smoking/pets:
  - No smoking inside.
  - No pets.
  - Evidence can trigger eviction, $500 fine, forfeiture of payments/deposits, and additional charges.
- Liability / third parties:
  - Owner responsibility limited to providing exclusive access to the Property.
  - Not responsible for adjacent properties, traffic, construction, inclement weather/natural disasters, third-party facilities/services/vendors selected by guest.
- Personal property:
  - Guest responsible for personal property.
  - Owner/agent/management not responsible for lost/stolen/damaged personal property, including weather-related damage.
- Maid service / access:
  - One included maid-service visit if desired; guest asked to vacate during cleaning.
  - Additional maid service available for additional payment.
  - Maids do not do personal laundry, cook, or babysit.
  - Owner/management/agent/pool/garden/other providers may access for maintenance, repair, and routine inspection.
- Amenities:
  - Reasonable linens, beach towels, kitchenware, TVs, washer/dryer.
  - Source says cribs, highchairs, baby equipment, beach chairs, beach umbrellas, kayaks, paddleboards, etc. are included; this should be verified as current before promising.
- Complaints / maintenance:
  - Guest must notify agent and management immediately during stay.
  - No post-departure claims for unreported complaints.
  - No refund/rebate if guest abandons property without authorization.
  - Repairs/service providers may enter to perform necessary repairs.
- Construction:
  - Construction exists throughout Turks & Caicos and may appear without warning.
  - No refund/adjustment for neighboring/off-property construction.
- No refunds:
  - No full/partial refund unless extreme discomfort/material inconvenience at the Property cannot be remedied in reasonable time after notice.
  - No-shows, late arrivals, reduced party size, early departures nonrefundable.
  - Neighbor disturbances not refundable.
- Medical conditions:
  - Guest must disclose allergies/medical conditions that could be exacerbated by property/island conditions.
  - Source requires addendum signed by Guest and Agent for such conditions.
- Air conditioning:
  - A/C is costly and may be metered; guest should conserve.
- Taxes:
  - Government occupancy tax listed as 12% and subject to change; guest responsible for increases/new taxes.
- Indemnification / limitation:
  - Broad guest indemnity and waiver for claims arising from use/occupancy.
  - Liability cap at total rental amount paid.
  - Claim/proceeding must be commenced within six months after rental period start date.
- Governing law / venue:
  - Turks & Caicos Islands law.
  - Courts of Turks & Caicos Islands.
  - Prevailing party recovers reasonable attorney fees/litigation expenses.
- Violation:
  - Owner/management may terminate and enter property.
  - Guest must vacate immediately and forfeits payments/deposits.
- Nature of agreement:
  - Not a residential lease; nightly access only.
- Enforcement:
  - Agreement becomes null/void if executed agreement and down payment are not received before hold expiration.

## DirectStay Product Implications

- Booking flow should capture reservation-specific variables rather than hardcoding:
  - guest name/email/phone
  - owner legal entity
  - property address
  - arrival/departure dates
  - check-in/check-out times
  - rent, taxes, deposit/down payment, final payment, due dates
  - security deposit/hold amount
  - max occupancy
  - cancellation policy version
  - included amenities/current exclusions
  - A/C/electric allowance if used
  - governing law/venue
- Reservation timeline should separately track:
  - quote/proposal sent
  - payment schedule accepted
  - agreement version presented
  - guest acceptance/signature timestamp
  - accepting IP/user agent/session metadata where available
  - payment state
  - security hold/deposit state
  - contract-complete state
- The guest-facing flow should make these items highly visible before acceptance:
  - cancellation/refund rule
  - nonrefundable deposit/down payment
  - security deposit/hold and additional charges
  - max occupancy = people present, not overnight only
  - no parties/events/weddings/reunions over occupancy
  - no pets/no smoking
  - travel insurance recommendation
  - check-in/check-out and holdover charge
  - Turks & Caicos law/venue
