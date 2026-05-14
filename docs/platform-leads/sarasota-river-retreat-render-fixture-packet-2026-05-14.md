# Sarasota River Retreat — internal render fixture packet

Status: builder-ready internal fixture only. No owner contact sent. No preview rendered/shared. Do not write production database rows from this packet without explicit approval.

## Purpose

Give the Preview Build refinement lab a safe fixture payload for a constrained Sarasota River Retreat render. This translates the source audit, content plan, design fingerprint, and rubric preflight into concrete page sections while keeping the thin-image case honest.

Source inputs:

- `sarasota-river-retreat-source-audit-2026-05-10.md`
- `sarasota-river-retreat-preview-content-plan-2026-05-13.md`
- `sarasota-river-retreat.DESIGN.md`
- `sarasota-river-retreat-preview-rubric-preflight-2026-05-14.md`

## Fixture metadata

- Suggested slug: `sarasota-river-retreat-preview`
- Property name: Sarasota River Retreat
- Location label: Sarasota, Florida / Phillippi River
- Intended route: non-production fixture or local seed only
- View modes: owner-review/default view and guest-clean `?view=guest`
- Preview posture: read-only, non-functional, no booking/payment/inquiry submission
- Share posture: not owner-shareable and not guest-shareable

## Design tokens

```json
{
  "palette": {
    "riverTeal": "#2f6f73",
    "mangroveGreen": "#526d55",
    "morningSky": "#d9e7e5",
    "warmShell": "#f3eadc",
    "mutedPoolBlue": "#82aeb6",
    "firepitAmber": "#bf7a3a",
    "ink": "#26312f"
  },
  "typography": {
    "display": "warm editorial serif",
    "body": "humanist sans"
  },
  "layout": {
    "density": "generous",
    "shape": "rounded owner-care cards",
    "heroStyle": "text-forward, no property-image background"
  }
}
```

## Allowed image inventory

```json
{
  "allowed": [
    {
      "asset": "uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp",
      "use": "owner-care/interior-trust section only",
      "alt": "Living room inside Sarasota River Retreat"
    }
  ],
  "rejectedForHeroOrPropertyStory": [
    "uploads/Logo/SRR_Logo-5262882.jpg?format=webp",
    "uploads/Attractions/Siesta_Key_Beach_Sarasota_Vacation_Rental-4492345.jpg?format=webp",
    "uploads/Attractions/Myakka_River_State_Park_Sarasota_Vacation_Home-4492597.jpg?format=webp",
    "uploads/Attractions/St_Armands_Circle_Sarasota-4507249.webp?format=webp",
    "thumbnails/640x480/Restaurants/Owens_FIsh_Camp_Sarasota-4515263.webp?format=webp",
    "thumbnails/640x480/Restaurants/Columbia_Restaurant_Sarasota-4515422.webp?format=webp",
    "uploads/A1/shadow-6446705.png?format=webp",
    "uploads/Home_Page/Sarasota_Vacation_Rental-4485558.jpg?format=webp",
    "uploads/Home_Page/Florida_Keys_Turquoise_Water_Canals-2688399.jpg?format=webp",
    "uploads/Images/bg-1-5554004-9136095.webp?format=webp",
    "uploads/Attractions/Sarasota_Popular_Attractions-4679899.jpg?format=webp"
  ]
}
```

## Section payload

```json
{
  "sections": [
    {
      "type": "hero",
      "headline": "A quiet Sarasota river retreat, planned with the owner details guests actually need.",
      "eyebrow": "Internal DirectStay preview fixture",
      "body": "A careful preview for a small waterfront home where the value is morning river rhythm, private pool and spa questions, dock and kayak planning, and direct owner care.",
      "facts": ["Sarasota / Phillippi River context", "3 bedrooms", "Sleeps 6", "Owner-cared direct-booking positioning"],
      "image": null,
      "guestVisibleWarning": "Preview only — dates, pricing, availability, and rules are not live."
    },
    {
      "type": "stayFitStrip",
      "headline": "Quick stay-fit checks",
      "cards": [
        {"label": "3 bedrooms / sleeps 6", "confidence": "source-observed"},
        {"label": "Sarasota waterfront / Phillippi River setting", "confidence": "source-observed"},
        {"label": "Pool, spa, dock, kayaks, and firepit", "confidence": "source-observed; use rules need owner confirmation"},
        {"label": "Direct owner care and local recommendations", "confidence": "source-positioned"}
      ]
    },
    {
      "type": "imageStory",
      "headline": "Owner-care and interior trust",
      "body": "The preview should make the home feel personally maintained before it tries to sell amenities. Guests should understand that the owner can help clarify restaurant ideas, pool questions, and the right way to plan a river day.",
      "image": "uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp",
      "imageUseNote": "Interior trust only; not evidence of river, pool, dock, kayak, or firepit conditions."
    },
    {
      "type": "signatureMoments",
      "headline": "A river day that still needs owner truth",
      "layout": "text-only timeline",
      "moments": [
        {"label": "Morning river atmosphere", "copy": "Frame as quiet Sarasota river rhythm, not a guaranteed wildlife sighting."},
        {"label": "Pool and spa reset", "copy": "Confirm heating, hours, fees, safety rules, and guest expectations before public use."},
        {"label": "Dock and kayak questions", "copy": "Confirm launch rules, life jackets, water/weather guidance, swimming and boating permissions."},
        {"label": "Firepit evening", "copy": "Confirm permitted use, fuel, quiet hours, and safety rules."}
      ]
    },
    {
      "type": "previewInquiry",
      "headline": "Plan the right Sarasota river stay before you inquire",
      "mode": "read-only",
      "fields": [
        "Preferred arrival and departure dates",
        "Party size and bedroom needs",
        "Pool/spa expectations and whether heating matters",
        "Dock, kayak, and water-safety questions",
        "Beach-day versus quiet-river-day priorities",
        "Restaurant, sunset, and local recommendation requests",
        "Parking, children, mobility, pets, quiet-hours, and firepit questions"
      ],
      "disclaimer": "Preview only — this form does not submit and availability is not live."
    },
    {
      "type": "directBookingValue",
      "headline": "Clearer trip cost before anyone commits",
      "mode": "structure-only",
      "rows": [
        "Lodging subtotal — owner-provided later",
        "Cleaning and owner fees — owner-provided later",
        "Taxes — calculated at launch",
        "Marketplace/service-fee comparison — only if owner approves",
        "Direct-booking language — keep non-numeric until approved"
      ],
      "copy": "Direct inquiries can make the full trip cost and house rules easier to understand before anyone commits."
    },
    {
      "type": "locationGuide",
      "headline": "Sarasota river planning notes to collect",
      "mode": "placeholder categories only",
      "items": [
        "Quiet river mornings and weather-aware kayak planning",
        "Beach-day planning without exact drive times until sourced",
        "Owner-favorite restaurants, coffee, and sunset spots",
        "Rainy-day Sarasota options to verify",
        "Pool, spa, firepit, dock, and quiet-hours safety notes"
      ]
    },
    {
      "type": "ownerCallout",
      "headline": "Owner correction checklist before sharing",
      "guestHidden": true,
      "items": [
        "Full photo gallery and photo-rights approval",
        "Preferred hero and section-image order",
        "Exact bed layout, bathrooms, occupancy, parking, pets, children suitability, accessibility, events, and quiet hours",
        "Pool/spa heating and use rules; dock, kayak, swimming, boating, life-jacket, weather, and firepit rules",
        "Rates, cleaning, taxes, deposits, cancellation, availability, minimum stays, and allowed platform-fee comparison language",
        "Owner-approved local recommendations and places not to recommend"
      ]
    }
  ]
}
```

## Guest-view bad-copy denylist

The guest-clean view must not include these terms or claims:

- benchmark
- strategy
- source material
- final live copy
- preview uses mock
- conversion
- guaranteed wildlife
- exact savings
- exact drive time
- swimming permission
- boating permission
- named restaurant recommendation
- owner-facing correction notes

## Verification checklist for a future local render

- Hero is text-forward and uses no rejected property/location art.
- Living-room image appears only in the owner-care/interior section.
- River, pool, dock, kayak, firepit, wildlife, beach, and guide content remain text-only or confirmation-labeled.
- Date/inquiry controls are visibly read-only and have no submit action.
- Trip-total module has no numeric rate, tax, fee, or savings claims.
- `?view=guest` hides the owner-correction panel and internal notes.
- Rendered guest text passes the bad-copy denylist above.
- Owner-share blockers are recorded separately from any quality score.

## Handoff recommendation

Use this packet for a local fixture or test seed first. If a future implementation path requires production database mutation, stop and request explicit approval before creating the preview record.
