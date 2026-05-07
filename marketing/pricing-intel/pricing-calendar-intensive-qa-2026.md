# Pricing Calendar Intensive QA — 2026

Generated: 2026-05-07T21:32:04.338Z

## Scope

- Tested weekly 7-night stays from 2026-05-07 through year-end.
- Added boundary stress cases around every direct, Airbnb, and VRBO pricing transition.
- Compared current single-record pricing behavior against expected per-night prorated behavior for stays spanning multiple records.
- Verified direct savings versus the cheaper OTA total.

## Summary

- Test cases: 100
- Issues found: 10
- Missing current calculations because stay spans pricing records: 0
- Savings outside 15–30% target: 10

## Findings

### Savings outside 15–30% target

- 2026-12-16 → 2026-12-23: 31.7% savings; direct $14800, cheapest OTA $21681.46
- 2026-12-17 → 2026-12-24: 33.2% savings; direct $15700, cheapest OTA $23495.01
- 2026-12-18 → 2026-12-25: 34.4% savings; direct $16600, cheapest OTA $25308.55
- 2026-12-19 → 2026-12-26: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-20 → 2026-12-27: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-21 → 2026-12-28: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-22 → 2026-12-29: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-23 → 2026-12-30: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-24 → 2026-12-31: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-25 → 2027-01-01: 33.5% savings; direct $17500, cheapest OTA $26307.81

## Recommendation

1. Boundary-span pricing is now prorated in the pricing engine; keep this QA as a regression suite for future rate changes.
2. Starting the premium direct rate on Dec 19 removed the too-small mid-December discount problem. Remaining out-of-band rows are only Christmas/New Year overlap stays, at roughly 32–34% savings, which reflects the intentionally generous $2,500/night direct holiday rate.
3. Otherwise the direct/Airbnb/VRBO math is consistent across the tested calendar.

Artifacts:
- `pricing-calendar-intensive-qa-2026.json`
- `pricing-calendar-intensive-qa-2026.csv`
