# Villa La Percha — Elite Destination Homes recovered details

Research date: 2026-05-08

## Key live/hidden Elite URLs

- Current unit page: `https://elitedestinationhomes.com/vrp/unit/Villa-La-Percha`
- Old unit slug redirects to current page: `https://elitedestinationhomes.com/vrp/unit/Luxurious_Villa_with_Pool_Spa_Swim_Platform_located_on_Taylor_Bay_Beach_2590-180776`
- Hidden/print page with calendar rates: `https://elitedestinationhomes.com/vrp/print-unit/Villa-La-Percha`
- Archived 2025 unit page: `https://web.archive.org/web/20250419233246/https://elitedestinationhomes.com/vrp/unit/Villa-La-Percha`
- 2021 EDH blog post: `https://elitedestinationhomes.com/2021/12/29/villa-la-percha-taylor-bay-beach/`

## Recovered current nightly calendar rates from hidden print page

Parsed from `<div class='cal-rate'>` entries on `https://elitedestinationhomes.com/vrp/print-unit/Villa-La-Percha`.

Only dates shown as rate-bearing/available in the print calendar are listed here; missing gaps were shown as unavailable or did not expose a rate in the print calendar.

- 2026-05-16 through 2026-05-26: `$1,550/night`
- 2026-06-01 through 2026-06-05: `$1,550/night`
- 2026-06-06 through 2026-07-10: `$1,695/night`
- 2026-08-08 through 2026-09-11: `$1,695/night`
- 2026-09-12 through 2026-10-13: `$1,550/night`
- 2026-10-21 through 2026-10-31: `$1,550/night`
- 2026-11-14 through 2026-11-24: `$1,550/night`
- 2026-11-25: `$1,588/night`
- 2026-11-26: `$1,550/night`
- 2026-11-27: `$1,553/night`
- 2026-11-28 through 2026-12-18: `$1,550/night`
- 2026-12-19 through 2026-12-26: `$2,950/night`
- 2027-05-08 through 2027-05-31: `$1,550/night`

## Quote endpoint verification

The page's JavaScript calls:

`https://elitedestinationhomes.com/?vrpjax=1&act=checkavailability&par=1`

with booking form fields:

- `obj[Arrival]`
- `obj[Departure]`
- `obj[Adults]`
- `obj[Children]`
- `obj[PropID]=71`
- `obj[v2]=1`

Examples verified:

- 2026-05-16 to 2026-05-23: rent `$10,850` = `$1,550/night`; total `$12,807.70`
- 2026-06-06 to 2026-06-13: rent `$11,865` = `$1,695/night`; total `$13,987.13`
- 2026-12-19 to 2026-12-26: rent `$20,650` = `$2,950/night`; total `$24,195.30`

Current fees/taxes observed in quote response:

- Rent
- Booking Fee
- Management Booking Fee: `$200`
- Turks & Caicos 12% Tax

## Recovered old details from 2025 Wayback page

The 2025 archived page had more granular amenity/category copy than the current live page. Items worth preserving/reusing where accurate:

- Reservations less than 7 nights must be approved before booking.
- Attractions: reefs, restaurants, bay/sound.
- Leisure: beachcombing, bird watching, eco tourism, horseback riding, paddle boating, photography, scenic drives, sightseeing, walking.
- Sports/adventure: deep sea fishing, sailing, scuba/snorkeling, swimming, water skiing.
- Car: necessary.
- Catering: guests provide their own meals; catering available.
- Dining: dining area and dining room.
- House cleaning: cleaning included.
- Safety: outdoor lighting, gated community, emergency phone numbers, personal safe, smoke/carbon monoxide detectors.
- Living: central A/C, ceiling fans, washer/dryer, ironing board, high-speed internet, Bluetooth sound system, Wi‑Fi, printer, roll-away bed `$`, in-room A/C.
- Kitchen: serving platters/bowls, Keurig, drip coffee maker, electric stove.
- Outdoor: outdoor kitchen, gas grill, private pool, pool heat available `$`, direct beach access, fire pit, swim platform, BBQ grill.
- Included toys/activities: beach towels, snorkeling gear, stand-up paddleboards, portable beach chairs, portable beach umbrella, two double kayaks, two yoga mats.
- Concierge/local: pre-grocery stocking `$`, chef services `$`, recommendations, follow-me airport service, massage therapist, groceries, hospital, ATM/bank, babysitter, fitness center, medical services.
- Baby gear: Pack n' Play, high chair, crib.

## Other recovered public copy

EDH 2021 blog post says Villa La Percha was a Taylor Bay Beach family rental and “starts at `$1,742` a night.” It links to the old verbose slug now redirected to the current unit page.
