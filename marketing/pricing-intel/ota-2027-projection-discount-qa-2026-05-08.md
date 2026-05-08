# Villa La Percha 2027 OTA Projection Discount QA — 2026-05-08

Live production QA after projecting 2026 Airbnb/VRBO comparison pricing into 2027. Target diagnostic band used here: roughly 15–30% direct savings versus OTA total; below 15% is weak, above 30% may be too generous or driven by holiday/peak mismatch.

- Scenarios tested: 94
- Flagged scenarios: 29
- Missing OTA comparison scenarios: 19
- Low-discount scenarios: 0
- High-discount scenarios: 10

## Key flagged scenarios

- 2027-01-01→2027-01-08 (7n, weekly-7): direct $16,000; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-01-08→2027-01-15 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-01-15→2027-01-22 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-01-22→2027-01-29 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-01-29→2027-02-05 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-02-05→2027-02-12 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-02-12→2027-02-19 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-02-19→2027-02-26 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-02-26→2027-03-05 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-03-05→2027-03-12 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-03-12→2027-03-19 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-03-19→2027-03-26 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-03-26→2027-04-02 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-04-02→2027-04-09 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-04-09→2027-04-16 (7n, weekly-7): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-04-16→2027-04-23 (7n, weekly-7): direct $11,850; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-12-17→2027-12-24 (7n, weekly-7): direct $15,700; Airbnb $23,495 (33.2%); VRBO $25,276 (37.9%); flags: airbnb_discount_high, vrbo_discount_very_high
- 2027-12-24→2027-12-31 (7n, weekly-7): direct $17,500; Airbnb $27,122 (35.5%); VRBO $26,309 (33.5%); flags: airbnb_discount_very_high, vrbo_discount_high
- 2027-12-18→2027-12-23 (5n, biweekly-5): direct $11,600; Airbnb $17,559 (33.9%); VRBO $18,429 (37.1%); flags: airbnb_discount_high, vrbo_discount_very_high
- 2027-01-02→2027-01-09 (7n, peak-start): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-04-10→2027-04-17 (7n, peak-final-week): direct $15,750; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-04-16→2027-04-23 (7n, cross-peak-to-spring): direct $11,850; Airbnb — (—%); VRBO — (—%); flags: missing_airbnb, missing_vrbo
- 2027-12-14→2027-12-19 (5n, pre-ramp): direct $8,000; Airbnb $10,305 (22.4%); VRBO $13,681 (41.5%); flags: vrbo_discount_very_high
- 2027-12-15→2027-12-20 (5n, vrbo-ramp-1): direct $8,900; Airbnb $12,119 (26.6%); VRBO $15,399 (42.2%); flags: vrbo_discount_very_high
- 2027-12-16→2027-12-21 (5n, vrbo-ramp-2): direct $9,800; Airbnb $13,932 (29.7%); VRBO $16,758 (41.5%); flags: vrbo_discount_very_high
- 2027-12-17→2027-12-22 (5n, vrbo-ramp-3): direct $10,700; Airbnb $15,746 (32.0%); VRBO $17,759 (39.7%); flags: airbnb_discount_high, vrbo_discount_very_high
- 2027-12-18→2027-12-23 (5n, vrbo-ramp-4): direct $11,600; Airbnb $17,559 (33.9%); VRBO $18,429 (37.1%); flags: airbnb_discount_high, vrbo_discount_very_high
- 2027-12-19→2027-12-24 (5n, holiday-start): direct $12,500; Airbnb $19,373 (35.5%); VRBO $18,792 (33.5%); flags: airbnb_discount_very_high, vrbo_discount_high
- 2027-12-27→2028-01-01 (5n, holiday-final): direct $12,500; Airbnb $19,373 (35.5%); VRBO $18,792 (33.5%); flags: airbnb_discount_very_high, vrbo_discount_high

## Representative clean scenarios

- 2027-04-23→2027-04-30 (7n, weekly-7): direct $11,200; Airbnb $14,427 (22.4%); VRBO $14,614 (23.4%); flags: 
- 2027-04-30→2027-05-07 (7n, weekly-7): direct $11,200; Airbnb $14,427 (22.4%); VRBO $14,614 (23.4%); flags: 
- 2027-05-07→2027-05-14 (7n, weekly-7): direct $11,200; Airbnb $14,427 (22.4%); VRBO $14,614 (23.4%); flags: 
- 2027-05-14→2027-05-21 (7n, weekly-7): direct $11,200; Airbnb $14,427 (22.4%); VRBO $14,614 (23.4%); flags: 
- 2027-05-21→2027-05-28 (7n, weekly-7): direct $11,200; Airbnb $14,427 (22.4%); VRBO $14,614 (23.4%); flags: 
- 2027-05-28→2027-06-04 (7n, weekly-7): direct $11,650; Airbnb $14,989 (22.3%); VRBO $15,038 (22.5%); flags: 
- 2027-06-04→2027-06-11 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,602 (21.5%); flags: 
- 2027-06-11→2027-06-18 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,602 (21.5%); flags: 
- 2027-06-18→2027-06-25 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,602 (21.5%); flags: 
- 2027-06-25→2027-07-02 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,602 (21.5%); flags: 
- 2027-07-02→2027-07-09 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,606 (21.5%); flags: 
- 2027-07-09→2027-07-16 (7n, weekly-7): direct $12,250; Airbnb $15,737 (22.2%); VRBO $15,611 (21.5%); flags: 
