const args = new Set(process.argv.slice(2));
const jsonOnly = args.has("--json");

const fixture = {
  ok: true,
  fixtureOnly: true,
  slug: "sarasota-river-retreat-preview",
  propertyName: "Sarasota River Retreat",
  location: "Sarasota, Florida / Phillippi River",
  sharePosture: "internal-only; not owner-shareable or guest-shareable",
  previewPosture: "read-only; no booking/payment/inquiry submission",
  sourceDocs: [
    "directstay/docs/platform-leads/sarasota-river-retreat-source-audit-2026-05-10.md",
    "directstay/docs/platform-leads/sarasota-river-retreat-preview-content-plan-2026-05-13.md",
    "directstay/docs/platform-leads/sarasota-river-retreat.DESIGN.md",
    "directstay/docs/platform-leads/sarasota-river-retreat-preview-rubric-preflight-2026-05-14.md",
    "directstay/docs/platform-leads/sarasota-river-retreat-render-fixture-packet-2026-05-14.md"
  ],
  designTokens: {
    palette: {
      riverTeal: "#2f6f73",
      mangroveGreen: "#526d55",
      morningSky: "#d9e7e5",
      warmShell: "#f3eadc",
      mutedPoolBlue: "#82aeb6",
      firepitAmber: "#bf7a3a",
      ink: "#26312f"
    },
    typography: { display: "warm editorial serif", body: "humanist sans" },
    layout: { density: "generous", shape: "rounded owner-care cards", heroStyle: "text-forward; no property-image background" }
  },
  allowedImages: [
    {
      asset: "uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp",
      use: "owner-care/interior-trust section only",
      alt: "Living room inside Sarasota River Retreat"
    }
  ],
  rejectedForHeroOrPropertyStory: [
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
  ],
  lead: {
    status: "QUALIFIED",
    fullName: "Internal Sarasota River Retreat Benchmark",
    email: "sarasota-river-retreat-preview@directstay.internal",
    phone: "+1-000-000-0000",
    propertyName: "Sarasota River Retreat",
    propertyLocation: "Sarasota, Florida / Phillippi River",
    source: "internal-preview-fixture",
    firstRead: "Internal DirectStay Preview Build fixture for a thin-image Sarasota river-retreat case; no owner communication sent.",
    nextAction: "Render only through a non-production fixture/local seed path. Do not create production database rows or share externally without explicit approval."
  },
  preview: {
    slug: "sarasota-river-retreat-preview",
    status: "DRAFT",
    propertyName: "Sarasota River Retreat",
    location: "Sarasota, Florida / Phillippi River",
    sourceUrls: [],
    heroTitle: "A quiet Sarasota river retreat, planned with the owner details guests actually need.",
    positioning: "A careful read-only DirectStay preview for a small waterfront home where the value is morning river rhythm, private pool and spa questions, dock and kayak planning, and direct owner care.",
    sections: [
      {
        kind: "heroTextOnly",
        eyebrow: "Read-only planning preview",
        title: "A quiet Sarasota river retreat, planned with the owner details guests actually need.",
        body: "A careful preview for a small waterfront home where the value is morning river rhythm, private pool and spa questions, dock and kayak planning, and direct owner care.",
        badges: ["Sarasota / Phillippi River context", "3 bedrooms", "Sleeps 6", "Preview only — rules and pricing are not live"],
        imageUrl: null
      },
      {
        kind: "stayFit",
        eyebrow: "Stay fit",
        title: "Quick stay-fit checks before anyone asks for dates.",
        items: [
          { label: "3 bedrooms / sleeps 6", body: "Source-observed; final bed and bathroom layout needs owner confirmation." },
          { label: "Sarasota waterfront / Phillippi River setting", body: "Use as broad context only until address, access, and water-use details are owner-confirmed." },
          { label: "Pool, spa, dock, kayaks, and firepit", body: "Source-observed; guest use rules, heating, safety, and availability need owner confirmation." },
          { label: "Direct owner care", body: "Position around clearer planning and local guidance, not around unsupported savings claims." }
        ]
      },
      {
        kind: "imageStory",
        eyebrow: "Owner-care and interior trust",
        title: "Start with the cared-for interior, not unsupported waterfront imagery.",
        body: "The preview should make the home feel personally maintained before it tries to sell amenities. Guests should understand that the owner can help clarify restaurant ideas, pool questions, and the right way to plan a river day.",
        imageUrl: "uploads/Home_Page/Sarasota_Main-6089374.jpg?format=webp",
        imageAlt: "Living room inside Sarasota River Retreat",
        imageUseNote: "Interior trust only; not evidence of river, pool, dock, kayak, or firepit conditions."
      },
      {
        kind: "signatureMoments",
        eyebrow: "River-day rhythm",
        title: "A river day that still needs owner truth.",
        body: "Frame the page as useful planning, with confirmation labels anywhere the source does not support a final claim.",
        items: [
          "Morning river atmosphere — do not guarantee wildlife sightings.",
          "Pool and spa reset — confirm heating, hours, fees, and safety rules.",
          "Dock and kayak questions — confirm launch rules, life jackets, weather guidance, and water-use approvals.",
          "Firepit evening — confirm permitted use, fuel, quiet hours, and safety rules."
        ]
      },
      {
        kind: "calendarMock",
        eyebrow: "Read-only inquiry planning",
        title: "Plan the right Sarasota river stay before you inquire.",
        body: "Collect preferred dates, party size, bedroom needs, pool/spa expectations, dock and kayak questions, beach-day versus quiet-river priorities, local recommendation requests, parking, children, mobility, pets, quiet-hours, and firepit questions. Preview only — this form does not submit and availability is not live."
      },
      {
        kind: "priceComparison",
        eyebrow: "Trip-total structure",
        title: "Clearer trip cost before anyone commits.",
        body: "No real rates are shown in this preview. A launch-ready version would separate lodging, cleaning, taxes, deposits, owner fees, and any marketplace/service-fee comparison only after the owner has reviewed and confirmed the assumptions."
      },
      {
        kind: "areaGuide",
        eyebrow: "Local planning notes to collect",
        title: "Use categories until the owner supplies real recommendations.",
        items: [
          "Quiet river mornings and weather-aware kayak planning.",
          "Beach-day planning without precise travel-time claims until sourced.",
          "Owner-favorite restaurants, coffee, and sunset spots.",
          "Rainy-day Sarasota options to verify.",
          "Pool, spa, firepit, dock, and quiet-hours safety notes."
        ]
      },
      {
        kind: "directBookingValue",
        eyebrow: "Owner correction path",
        title: "This preview should invite corrections before it sells anything.",
        body: "Before sharing, collect the full photo gallery and rights approval; bed, bath, occupancy, parking, pets, children, accessibility, events, and quiet-hour details; pool/spa/dock/kayak/firepit rules; rates, fees, taxes, deposits, cancellation, availability, minimum stays, and owner-approved local recommendations.",
        guestHidden: true
      }
    ],
    ownerCallouts: [
      { label: "Internal fixture only", body: "Use for local renderer/QA work. Do not share externally without Jaimal approval." },
      { label: "Image integrity", body: "Hero must remain text-forward; the living-room image is allowed only in the interior trust section." },
      { label: "Owner confirmation required", body: "Rules, rates, policies, photo rights, exact guide claims, and all water/pool/spa/firepit details need owner confirmation." }
    ]
  },
  guestViewDenylist: [
    "benchmark",
    "strategy",
    "source material",
    "final live copy",
    "preview uses mock",
    "conversion",
    "guaranteed wildlife",
    "exact savings",
    "exact drive time",
    "swimming permission",
    "boating permission",
    "named restaurant recommendation",
    "owner-facing correction notes"
  ],
  verificationChecklist: [
    "Hero is text-forward and uses no rejected property/location art.",
    "Living-room image appears only in the owner-care/interior section.",
    "River, pool, dock, kayak, firepit, wildlife, beach, and guide content remain text-only or confirmation-labeled.",
    "Date/inquiry controls are visibly read-only and have no submit action.",
    "Trip-total module has no numeric rate, tax, fee, or savings claims.",
    "?view=guest hides owner-correction panel and internal notes.",
    "Rendered guest text passes the bad-copy denylist.",
    "Owner-share blockers are recorded separately from any quality score."
  ]
};

const serialized = JSON.stringify(fixture, null, 2);

if (!jsonOnly) {
  console.error("Sarasota River Retreat fixture payload (safe: no database writes). Use --json to suppress this note.");
}

console.log(serialized);
