# Goal brief — Villa La Percha OTA weekly pricing records

Mission: Gather weekly selected-date pricing through 2026-12-31 for Airbnb and VRBO, then propose smoothed date-range records before any database/table write.

Boundaries:
- No writes to pricing tables.
- No external communications.
- Browser automation/screenshots are allowed for evidence.
- Respect blockers: login/captcha/manual challenge means record as blocker, do not bypass.

Assumptions unless Jaimal corrects:
- Week cadence: Saturday check-in to Saturday check-out.
- Party size: 8 guests.
- Currency: USD.
- Use displayed total / 7 as platform nightly when only total is available.
- Smooth adjacent weeks within roughly 5–7% unless Thanksgiving, Christmas, New Year, or Jan-Apr peak creates a clear break.

Definition of done:
- Weekly raw observations with source/date/total/nightly/confidence.
- Screenshots for browser-observed VRBO pricing where accessible.
- Proposed smoothed records for Airbnb and VRBO shown to Jaimal only.
