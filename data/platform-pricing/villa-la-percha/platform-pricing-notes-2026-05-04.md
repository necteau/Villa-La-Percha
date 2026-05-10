# Villa La Percha platform pricing scout — 2026-05-04

Sources checked:
- Airbnb listing: https://www.airbnb.com/rooms/20472078
- VRBO listing: https://www.vrbo.com/935749ha
- RentByOwner mirror: https://www.rentbyowner.com/property/villa-la-percha-full-home-with-kayaks-ocean-access-pool-and-more/HA-121935749

## Usable pulls

### Airbnb
Playwright/browser fetch can see selected-date totals on Airbnb for some date ranges.

| Dates | Guests | Airbnb displayed total | Implied nightly | Notes |
|---|---:|---:|---:|---|
| 2026-05-16 → 2026-05-23 | 8 | $12,908 for 7 nights | $1,844.00 | Price breakdown modal exposes $1,844.00 and $12,908.00; no detailed service/tax line items captured yet. |
| 2026-06-20 → 2026-06-27 | 8 | $14,080 for 7 nights | $2,011.43 | Price breakdown modal exposes $2,011.43 and $14,080.00; no detailed service/tax line items captured yet. |
| 2026-12-20 → 2026-12-27 | 8 | no selected-date total captured | — | Listing loaded, but selected dates did not produce book-it total in this run; may be unavailable, blocked, or Airbnb did not hydrate the quote. |

Artifacts:
- `data/platform-pricing/villa-la-percha/scout-2026-05-04/result.json`
- `data/platform-pricing/villa-la-percha/airbnb-breakdown-2026-05-04/result.json`
- screenshots in the sibling artifact directories.

### RentByOwner mirror
The RentByOwner mirror exposes a simple listing-level nightly rate:

- `US $1,985 per night`
- Text says: “Nightly rates from: US $1,985” and “Price per night US $1,985”.

This appears to be a mirror/affiliate listing, not an authoritative VRBO quote. Useful as another corroborating public comparison point, but I would label it carefully if used.

## Blocked / unreliable

### VRBO
VRBO returned HTTP 429 with the “Bot or Not?” challenge page for the listing/date URL. No usable price details were extractable from the automated request.

## Suggested product use

For the website, safest data model is:

```ts
{
  source: 'airbnb',
  listingUrl: 'https://www.airbnb.com/rooms/20472078',
  observedAt: '2026-05-04T01:xx:xxZ',
  checkIn: '2026-05-16',
  checkOut: '2026-05-23',
  guests: 8,
  displayedTotalUsd: 12908,
  displayedNightlyUsd: 1844,
  confidence: 'observed-browser-page',
  caveat: 'Platform prices can change; taxes/fees line items not captured.'
}
```

Do not claim exact VRBO selected-date totals from this run; VRBO was blocked.
