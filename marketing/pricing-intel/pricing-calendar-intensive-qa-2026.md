# Pricing Calendar Intensive QA — 2026

Generated: 2026-05-07T21:28:07.233Z

## Scope

- Tested weekly 7-night stays from 2026-05-07 through year-end.
- Added boundary stress cases around every direct, Airbnb, and VRBO pricing transition.
- Compared current single-record pricing behavior against expected per-night prorated behavior for stays spanning multiple records.
- Verified direct savings versus the cheaper OTA total.

## Summary

- Test cases: 100
- Issues found: 13
- Missing current calculations because stay spans pricing records: 0
- Savings outside 15–30% target: 13

## Findings

### Savings outside 15–30% target

- 2026-12-10 → 2026-12-17: 14.1% savings; direct $12400, cheapest OTA $14427.27
- 2026-12-11 → 2026-12-18: 9.9% savings; direct $13000, cheapest OTA $14427.27
- 2026-12-12 → 2026-12-19: 5.7% savings; direct $13600, cheapest OTA $14427.27
- 2026-12-13 → 2026-12-20: 10.7% savings; direct $14500, cheapest OTA $16240.82
- 2026-12-14 → 2026-12-21: 14.7% savings; direct $15400, cheapest OTA $18054.36
- 2026-12-18 → 2026-12-25: 32% savings; direct $17200, cheapest OTA $25308.55
- 2026-12-19 → 2026-12-26: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-20 → 2026-12-27: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-21 → 2026-12-28: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-22 → 2026-12-29: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-23 → 2026-12-30: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-24 → 2026-12-31: 33.5% savings; direct $17500, cheapest OTA $26307.81
- 2026-12-25 → 2027-01-01: 33.5% savings; direct $17500, cheapest OTA $26307.81

## Recommendation

1. Boundary-span pricing is now prorated in the pricing engine; keep this QA as a regression suite for future rate changes.
2. The selected smoother holiday pricing creates two intentional edge effects: Dec 10–14 arrivals that only partially overlap the ramp have a smaller-than-target savings, while Dec 18 onward remains more generous than the standard target.
3. Otherwise the direct/Airbnb/VRBO math is consistent across the tested calendar.

Artifacts:
- `pricing-calendar-intensive-qa-2026.json`
- `pricing-calendar-intensive-qa-2026.csv`
