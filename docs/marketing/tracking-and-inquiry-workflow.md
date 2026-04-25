# Villa La Percha — Tracking and Inquiry Workflow

## Purpose
Create a simple system so every inquiry is captured, responded to quickly, and tracked back to a likely source.

## Tracking Plan

### Suggested Event Names
- `view_availability`
- `select_dates`
- `submit_inquiry`
- `click_email`
- `view_experience_page`
- `view_price_comparison`
- `view_map`

### Suggested Source Parameters
Whenever possible, capture basic source/UTM values:
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

### Recommended Future Setup
- Google Analytics 4
- Google Search Console
- Meta Pixel only if/when Meta campaigns start

## Inquiry Workflow
1. Guest lands on site
2. Guest checks dates
3. Guest submits inquiry
4. Inquiry email arrives at `VillaLaPercha@gmail.com`
5. Respond within 24 hours
6. Log inquiry source, requested dates, and outcome
7. If booked, log booking source and value

## Lead Response Standard
- **Goal:** same day when practical, within 24 hours max
- If not ready with full answer, send a warm acknowledgment first
- Keep replies personal, fast, and specific to dates/group size

## Recommended Data to Track Per Inquiry
- Date received
- Guest name
- Email
- Check-in
- Check-out
- Nights
- Number of guests
- Children Y/N
- Source
- Status (new / replied / qualified / booked / lost)
- Direct quote sent Y/N
- Airbnb quote known Y/N
- VRBO quote known Y/N
- Notes

## Manual Workflow for Now
Until analytics and CRM are live:
- Use the inquiry inbox as the trigger
- Record leads in a simple CSV or sheet
- Update status after each reply / booking decision

## Pricing Workflow
For selected date windows, record:
- direct nightly price
- Airbnb nightly price
- Airbnb fees
- Airbnb taxes
- VRBO nightly price
- VRBO fees
- VRBO taxes

Then enter these into `src/data/pricingTable.ts` so the website can calculate real total comparisons.

## Bottlenecks / Dependencies
- Resend API key must be configured in Vercel
- Live inquiry submission test still needs to happen
- Exact OTA pricing requires manual capture when platforms block automation
