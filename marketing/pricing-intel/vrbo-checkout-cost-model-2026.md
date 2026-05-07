# VRBO Checkout Cost Model — Villa La Percha 2026

Generated: 2026-05-07T21:03:35.126Z

## What changed

VRBO labels the tax as **Turks & Caicos 12% Tax**, but checkout samples show that 12% is not applied to the displayed stay subtotal. It appears to be applied to a lower taxable rent base, while the displayed subtotal includes non-taxed markup/fees. For website comparison purposes, use an **effective tax rate on the displayed VRBO subtotal**, not a naive 12% of subtotal.

## Checkout samples

| Stay | Nights | Display nightly | Display subtotal | Tax | Total | Implied taxable nightly | Effective tax on subtotal |
|---|---:|---:|---:|---:|---:|---:|---:|
| 2026-05-16 → 2026-05-23 | 7 | $1,882.81 | $13,179.70 | $1,302.00 | $14,481.70 | $1,550.00 | 9.88% |
| 2026-06-20 → 2026-06-27 | 7 | $2,020.90 | $14,146.33 | $1,423.80 | $15,570.13 | $1,695.00 | 10.06% |
| 2026-07-04 → 2026-07-10 | 6 | $2,007.69 | $12,046.14 | $1,220.40 | $13,266.54 | $1,695.00 | 10.13% |
| 2026-08-15 → 2026-08-22 | 7 | $1,983.90 | $13,887.33 | $1,423.80 | $15,311.13 | $1,695.00 | 10.25% |
| 2026-09-05 → 2026-09-12 | 7 | $2,036.90 | $14,258.33 | $1,423.80 | $15,682.13 | $1,695.00 | 9.99% |
| 2026-09-19 → 2026-09-26 | 7 | $1,870.67 | $13,094.70 | $1,302.00 | $14,396.70 | $1,550.00 | 9.94% |
| 2026-10-24 → 2026-10-31 | 7 | $1,870.67 | $13,094.70 | $1,302.00 | $14,396.70 | $1,550.00 | 9.94% |
| 2026-11-21 → 2026-11-28 | 7 | $1,813.22 | $12,692.54 | $1,304.40 | $13,996.94 | $1,552.86 | 10.28% |
| 2026-12-05 → 2026-12-12 | 7 | $1,796.67 | $12,576.70 | $1,302.00 | $13,878.70 | $1,550.00 | 10.35% |
| 2026-12-12 → 2026-12-19 | 7 | $1,810.10 | $12,670.70 | $1,302.00 | $13,972.70 | $1,550.00 | 10.28% |
| 2026-12-19 → 2026-12-26 | 7 | $3,365.10 | $23,555.73 | $2,482.08 | $26,037.81 | $2,954.86 | 10.54% |

## Proposed website VRBO cost records

These retain the smoothed displayed nightly rates already imported, but replace the old flat tax assumption with effective tax rates derived from checkout.

| ID | Start | End | Display nightly | Effective tax rate | Approx all-in 7-night total | Notes |
|---|---:|---:|---:|---:|---:|---|
| vrbo-current-spring-2026 | 2026-05-07 | 2026-06-01 | $1,900.00 | 9.88% | $14,613.91 | May checkout sample: tax $1,302 on $13,179.70 displayed subtotal; effective tax ~9.88% because VRBO taxes only taxable rent base, not all displayed fees. |
| vrbo-early-summer-2026 | 2026-06-01 | 2026-07-06 | $2,025.00 | 10.06% | $15,601.71 | June checkout sample: tax $1,423.80 on $14,146.33 displayed subtotal; effective tax ~10.06%. |
| vrbo-mid-summer-blocked-2026 | 2026-07-06 | 2026-08-08 | $2,025.00 | 10.13% | $15,611.07 | July 4-10 sample: tax $1,220.40 on $12,046.14 displayed subtotal; effective tax ~10.13%. |
| vrbo-late-summer-2026 | 2026-08-08 | 2026-09-08 | $2,000.00 | 10.12% | $15,416.80 | Blend of Aug 15-22 effective tax 10.25% and Sep 5-12 effective tax 9.99%. |
| vrbo-september-stepdown-2026 | 2026-09-08 | 2026-09-16 | $1,900.00 | 9.99% | $14,628.67 | Interpolated from early/late September checkout samples; use ~9.99% effective tax. |
| vrbo-fall-shoulder-2026 | 2026-09-16 | 2026-10-27 | $1,825.00 | 9.94% | $14,045.22 | Sep 19-26 and Oct 24-31 both show tax $1,302 on $13,094.70 subtotal; effective tax ~9.94%. |
| vrbo-late-october-early-november-gap-2026 | 2026-10-27 | 2026-11-14 | $1,825.00 | 10.08% | $14,062.72 | Gap between Oct shoulder sample at 9.94% and Nov sample at 10.28%; use blended effective tax. |
| vrbo-thanksgiving-early-december-2026 | 2026-11-14 | 2026-12-15 | $1,850.00 | 10.30% | $14,283.85 | Nov 21-Dec 12 samples cluster around 10.28%-10.35% effective tax; use 10.30%. |
| vrbo-holiday-ramp-1-2026 | 2026-12-15 | 2026-12-16 | $2,175.00 | 10.30% | $16,793.18 | Use early-December effective tax until holiday checkout sample begins. |
| vrbo-holiday-ramp-2-2026 | 2026-12-16 | 2026-12-17 | $2,500.00 | 10.30% | $19,302.50 | Use early-December effective tax until holiday checkout sample begins. |
| vrbo-holiday-ramp-3-2026 | 2026-12-17 | 2026-12-18 | $2,800.00 | 10.30% | $21,618.80 | Use early-December effective tax until holiday checkout sample begins. |
| vrbo-holiday-ramp-4-2026 | 2026-12-18 | 2026-12-19 | $3,075.00 | 10.42% | $23,767.91 | Bridge between early-December ~10.30% and Christmas-week 10.54%. |
| vrbo-christmas-new-year-2026 | 2026-12-19 | 2027-01-01 | $3,400.00 | 10.54% | $26,307.81 | Christmas week sample: tax $2,482.08 on $23,555.73 subtotal; effective tax ~10.54%. |

## Implementation note

The current pricing engine can represent this by storing VRBO taxes as a percent charge on the displayed VRBO nightly subtotal using the effective tax rates above. This is intentionally a comparison model, not a claim about VRBO's internal tax base.
