# Pricing Calendar Intensive QA — 2026

Generated: 2026-05-07T21:20:02.640Z

## Scope

- Tested weekly 7-night stays from 2026-05-07 through year-end.
- Added boundary stress cases around every direct, Airbnb, and VRBO pricing transition.
- Compared current single-record pricing behavior against expected per-night prorated behavior for stays spanning multiple records.
- Verified direct savings versus the cheaper OTA total.

## Summary

- Test cases: 100
- Issues found: 12
- Missing current calculations because stay spans pricing records: 0
- Savings outside 15–30% target: 12

## Findings

### Savings outside 15–30% target

- 2026-12-14 → 2026-12-21: 34.6% savings; direct $11800, cheapest OTA $18054.36
- 2026-12-15 → 2026-12-22: 40.1% savings; direct $11900, cheapest OTA $19867.92
- 2026-12-16 → 2026-12-23: 45.1% savings; direct $11900, cheapest OTA $21681.46
- 2026-12-17 → 2026-12-24: 49.4% savings; direct $11900, cheapest OTA $23495.01
- 2026-12-18 → 2026-12-25: 53% savings; direct $11900, cheapest OTA $25308.55
- 2026-12-19 → 2026-12-26: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-20 → 2026-12-27: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-21 → 2026-12-28: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-22 → 2026-12-29: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-23 → 2026-12-30: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-24 → 2026-12-31: 54.8% savings; direct $11900, cheapest OTA $26307.81
- 2026-12-25 → 2027-01-01: 54.8% savings; direct $11900, cheapest OTA $26307.81

## Recommendation

1. Boundary-span pricing is now prorated in the pricing engine; keep this QA as a regression suite for future rate changes.
2. If 15–30% savings is strict, revisit Christmas/New Year direct pricing; with $1,700/night it is intentionally ~55% cheaper than OTA.
3. Otherwise the direct/Airbnb/VRBO math is consistent across the tested calendar.

Artifacts:
- `pricing-calendar-intensive-qa-2026.json`
- `pricing-calendar-intensive-qa-2026.csv`
