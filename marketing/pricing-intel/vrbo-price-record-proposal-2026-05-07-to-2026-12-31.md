# Proposed VRBO Price Records — Villa La Percha

Generated: 2026-05-07T20:46:03.503Z
Source capture: `directstay/marketing/pricing-intel/vrbo-calendar-prices-2026-05-07.md`
Daily inferred CSV: `directstay/marketing/pricing-intel/vrbo-calendar-daily-inferred-2026-05-07-to-2026-12-31.csv`

## Method

- Kept every scraped VRBO calendar price as **observed**.
- Filled blank/blocked dates from 2026-05-07 through 2026-12-31 using nearest visible prices and interpolation between observed boundaries.
- Smoothed daily noise into larger date ranges, rounded to clean sales/admin-friendly nightly rates.
- Treat these as **proposed VRBO-facing website records**, not proof of VRBO’s internal unavailable-date pricing.

## Proposed range records

| ID | Start | End | Nights | Nightly VRBO rate | Rationale |
|---|---:|---:|---:|---:|---|
| vrbo-current-spring-2026 | 2026-05-07 | 2026-05-31 | 25 | $1,900 | May capture only exposed May 16–21 around $1,877–$1,897; use $1,900 for the rest of May rather than overfitting blanks. |
| vrbo-early-summer-2026 | 2026-06-01 | 2026-07-05 | 35 | $2,025 | June observed mostly $1,990–$2,031 and July 1–5 around $2,039–$2,042; round to one clean summer rate. |
| vrbo-mid-summer-blocked-2026 | 2026-07-06 | 2026-08-07 | 33 | $2,025 | Blocked/unpriced visible gap between July 6 and Aug 7; nearest visible prices on both sides are about $2,033–$2,042, so carry the summer rate through the gap. |
| vrbo-late-summer-2026 | 2026-08-08 | 2026-09-07 | 31 | $2,000 | August/early September observed alternates roughly $1,966 weekdays and $2,029–$2,033 weekends; smooth to $2,000. |
| vrbo-september-stepdown-2026 | 2026-09-08 | 2026-09-15 | 8 | $1,900 | September declines from $1,947 to $1,819 over this week; use a short shoulder step instead of daily changes. |
| vrbo-fall-shoulder-2026 | 2026-09-16 | 2026-10-26 | 41 | $1,825 | Observed fall dates cluster tightly around $1,804–$1,858; $1,825 is clean and faithful. |
| vrbo-late-october-early-november-gap-2026 | 2026-10-27 | 2026-11-13 | 18 | $1,825 | Blocked gap bracketed by Oct 21–26 and Nov 14–30, both around $1,802–$1,864; carry fall shoulder rate. |
| vrbo-thanksgiving-early-december-2026 | 2026-11-14 | 2026-12-14 | 31 | $1,850 | Observed Nov 14–Dec 14 mostly $1,802–$1,864 with minor variation; round to $1,850. |
| vrbo-holiday-ramp-1-2026 | 2026-12-15 | 2026-12-15 | 1 | $2,175 | Observed Dec 15 $2,179; round to $2,175. |
| vrbo-holiday-ramp-2-2026 | 2026-12-16 | 2026-12-16 | 1 | $2,500 | Observed Dec 16 $2,510; round to $2,500. |
| vrbo-holiday-ramp-3-2026 | 2026-12-17 | 2026-12-17 | 1 | $2,800 | Observed Dec 17 $2,788; round to $2,800. |
| vrbo-holiday-ramp-4-2026 | 2026-12-18 | 2026-12-18 | 1 | $3,075 | Observed Dec 18 $3,081; round to $3,075. |
| vrbo-christmas-new-year-2026 | 2026-12-19 | 2026-12-31 | 13 | $3,400 | Observed Dec 19–20 $3,357–$3,410; Dec 21–31 blank likely peak/blocked. Use $3,400 through year-end. |

## JSON draft for website pricing records

```json
[
  {
    "id": "vrbo-current-spring-2026",
    "platform": "vrbo",
    "startDate": "2026-05-07",
    "endDate": "2026-06-01",
    "nightlyRate": 1900,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "May capture only exposed May 16–21 around $1,877–$1,897; use $1,900 for the rest of May rather than overfitting blanks."
  },
  {
    "id": "vrbo-early-summer-2026",
    "platform": "vrbo",
    "startDate": "2026-06-01",
    "endDate": "2026-07-06",
    "nightlyRate": 2025,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "June observed mostly $1,990–$2,031 and July 1–5 around $2,039–$2,042; round to one clean summer rate."
  },
  {
    "id": "vrbo-mid-summer-blocked-2026",
    "platform": "vrbo",
    "startDate": "2026-07-06",
    "endDate": "2026-08-08",
    "nightlyRate": 2025,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Blocked/unpriced visible gap between July 6 and Aug 7; nearest visible prices on both sides are about $2,033–$2,042, so carry the summer rate through the gap."
  },
  {
    "id": "vrbo-late-summer-2026",
    "platform": "vrbo",
    "startDate": "2026-08-08",
    "endDate": "2026-09-08",
    "nightlyRate": 2000,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "August/early September observed alternates roughly $1,966 weekdays and $2,029–$2,033 weekends; smooth to $2,000."
  },
  {
    "id": "vrbo-september-stepdown-2026",
    "platform": "vrbo",
    "startDate": "2026-09-08",
    "endDate": "2026-09-16",
    "nightlyRate": 1900,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "September declines from $1,947 to $1,819 over this week; use a short shoulder step instead of daily changes."
  },
  {
    "id": "vrbo-fall-shoulder-2026",
    "platform": "vrbo",
    "startDate": "2026-09-16",
    "endDate": "2026-10-27",
    "nightlyRate": 1825,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed fall dates cluster tightly around $1,804–$1,858; $1,825 is clean and faithful."
  },
  {
    "id": "vrbo-late-october-early-november-gap-2026",
    "platform": "vrbo",
    "startDate": "2026-10-27",
    "endDate": "2026-11-14",
    "nightlyRate": 1825,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Blocked gap bracketed by Oct 21–26 and Nov 14–30, both around $1,802–$1,864; carry fall shoulder rate."
  },
  {
    "id": "vrbo-thanksgiving-early-december-2026",
    "platform": "vrbo",
    "startDate": "2026-11-14",
    "endDate": "2026-12-15",
    "nightlyRate": 1850,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Nov 14–Dec 14 mostly $1,802–$1,864 with minor variation; round to $1,850."
  },
  {
    "id": "vrbo-holiday-ramp-1-2026",
    "platform": "vrbo",
    "startDate": "2026-12-15",
    "endDate": "2026-12-16",
    "nightlyRate": 2175,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Dec 15 $2,179; round to $2,175."
  },
  {
    "id": "vrbo-holiday-ramp-2-2026",
    "platform": "vrbo",
    "startDate": "2026-12-16",
    "endDate": "2026-12-17",
    "nightlyRate": 2500,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Dec 16 $2,510; round to $2,500."
  },
  {
    "id": "vrbo-holiday-ramp-3-2026",
    "platform": "vrbo",
    "startDate": "2026-12-17",
    "endDate": "2026-12-18",
    "nightlyRate": 2800,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Dec 17 $2,788; round to $2,800."
  },
  {
    "id": "vrbo-holiday-ramp-4-2026",
    "platform": "vrbo",
    "startDate": "2026-12-18",
    "endDate": "2026-12-19",
    "nightlyRate": 3075,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Dec 18 $3,081; round to $3,075."
  },
  {
    "id": "vrbo-christmas-new-year-2026",
    "platform": "vrbo",
    "startDate": "2026-12-19",
    "endDate": "2027-01-01",
    "nightlyRate": 3400,
    "currency": "USD",
    "charges": [
      {
        "label": "Occupancy taxes",
        "category": "tax",
        "type": "percent",
        "value": 0.1038,
        "basis": "base"
      }
    ],
    "notes": "Observed Dec 19–20 $3,357–$3,410; Dec 21–31 blank likely peak/blocked. Use $3,400 through year-end."
  }
]
```

## Coverage summary

- Daily file covers 2026-05-07 through 2026-12-31: 239 calendar days.
- Observed dates: 144.
- Inferred dates: 95.
- Proposed records: 13.

## Recommendation

Use the range records above for the website/owner portal if the goal is a clean VRBO comparison table. For direct booking pricing, keep direct rates lower than these records so the direct-booking advantage remains obvious.
