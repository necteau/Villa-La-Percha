import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const createdByEmail = "bishop@directstay.internal";

const builds = [
  {
    slug: "paradise-point-exuma-preview",
    owner: "Legacy POC Migration",
    email: "paradise-point-exuma-preview@directstay.internal",
    phone: "+1-000-000-0000",
    propertyName: "Paradise Point Exuma",
    location: "Tar Bay, Great Exuma, Bahamas",
    currentWebsite: "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/paradise-point-exuma",
    goal: "Migrate legacy DirectStay proof-of-concept mockup into the modern Preview Build system as an internal draft.",
    heroTitle: "Paradise Point Exuma, framed for the direct beach week.",
    positioning: "A read-only DirectStay Preview Build concept for a two-bedroom oceanfront Exuma villa, focused on private-beach clarity, simple arrival planning, and owner-confirmed guest details before launch.",
    sourceUrls: [
      "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/paradise-point-exuma/index.html",
      "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/paradise-point-exuma/styles.css"
    ],
    facts: [
      "Property name observed in legacy mockup: Paradise Point Exuma.",
      "Location observed/inferred from legacy mockup: Great Exuma / Tar Bay, Bahamas.",
      "Legacy mockup describes a two-bedroom oceanfront villa with two full bathrooms.",
      "Legacy mockup emphasizes private beach, clear turquoise water, airport access, and proximity to George Town.",
      "Layout references include a main floor and lower level. Exact room configuration must be owner-confirmed."
    ],
    assumptions: [
      "Photo rights, exact beach access rules, water safety guidance, rates, taxes, fees, minimum stays, and availability are unknown.",
      "Airport and George Town proximity should be converted into exact owner-approved drive times before any owner-share or launch.",
      "Bedroom/bath labels and floor layout are migrated from the legacy mockup and need source confirmation.",
      "No booking, inquiry, payment, calendar, or availability function is active in this preview."
    ],
    designBrief: "Design fingerprint: Exuma-specific palette using turquoise shallows, white sand, sun-washed neutrals, and quiet tropical green. Tone should be airy and practical rather than resort-brochure generic. Guest promise: a simple private-beach week where travelers understand arrival, beach rhythm, sleeping layout, and local planning questions before they inquire.",
    sections: [
      { kind: "heroImage", heroOnly: true, badges: ["Exuma beach concept", "Read-only preview", "Owner-confirmed before launch"] },
      { kind: "stayFit", eyebrow: "Stay fit", title: "A two-bedroom Exuma beach base with room details to confirm.", body: "The legacy concept presents Paradise Point as an oceanfront villa for guests who care more about beach access, water clarity, and an easy island rhythm than scrolling another marketplace grid.", items: [
        { label: "Observed", body: "Two bedrooms and two full bathrooms are stated in the legacy mockup." },
        { label: "Guest planning", body: "The finished page should answer arrival, grocery, beach access, and sleeping-layout questions before guests write in." },
        { label: "Owner confirmation", body: "Exact capacity, bed sizes, floor layout, beach rules, and water-safety notes must be confirmed." }
      ]},
      { kind: "signatureMoments", eyebrow: "Beach rhythm", title: "Build the page around the turquoise-water stay, not generic villa luxury.", body: "The useful direct-booking story is practical: wake up near the water, know how the villa is laid out, understand what guests should bring, and ask date-specific questions before committing." },
      { kind: "calendarMock", eyebrow: "Date-aware inquiry", title: "Ask for the right Exuma week before a guest sends a message.", body: "The preview keeps calendar behavior read-only, but the live concept would collect arrival window, party size, bedroom needs, flight timing, and beach/water expectations before the owner replies." },
      { kind: "priceComparison", eyebrow: "Trip-total clarity", title: "Show the structure of direct pricing without inventing rates.", body: "No real rates are shown here. Before launch, DirectStay would confirm nightly pricing, cleaning, taxes, security deposit, marketplace comparison assumptions, and whether any savings language is allowed." },
      { kind: "areaGuide", eyebrow: "Exuma planning", title: "Local guide placeholders should become owner-approved island guidance.", body: "Replace generic destination copy with owner-approved notes: airport arrival, groceries, George Town errands, favorite beaches, boat-day options, restaurants, and weather/day-plan advice.", items: ["Airport and arrival planning", "George Town / Tar Bay orientation", "Beach, boating, and water-safety questions", "Restaurants and grocery stops to confirm"] }
    ],
    callouts: [
      { label: "Migration source", body: "Built from the legacy Paradise Point Exuma static proof-of-concept. Treat all content as draft until owner/source confirmation." },
      { label: "Safety gate", body: "Do not share externally until photo rights, exact layout, beach/water rules, rates, taxes, fees, availability, and local claims are verified." },
      { label: "Removal path", body: "The legacy repo can be retired after this Preview Build packet is preserved and the workspace map is updated." }
    ]
  },
  {
    slug: "surfsong-villa-preview",
    owner: "Legacy POC Migration",
    email: "surfsong-villa-preview@directstay.internal",
    phone: "+1-000-000-0000",
    propertyName: "Surfsong Villa",
    location: "Beacon Hill / Maho Reef, Sint Maarten",
    currentWebsite: "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/surfsong-villa",
    goal: "Migrate legacy DirectStay proof-of-concept mockup into the modern Preview Build system as an internal draft.",
    heroTitle: "Surfsong Villa, organized for the high-capacity waterfront stay.",
    positioning: "A read-only DirectStay Preview Build concept for a six-bedroom Sint Maarten waterfront villa, focused on group-layout confidence, Maho/Simpson Bay orientation, and owner-corrected luxury details before launch.",
    sourceUrls: [
      "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/surfsong-villa/index.html",
      "legacy-workspace://business/direct-booking-ai-ops/proof-of-concepts/surfsong-villa/styles.css"
    ],
    facts: [
      "Property name observed in legacy mockup: Surfsong Villa.",
      "Location observed/inferred from legacy mockup: Beacon Hill / Maho Reef area, Sint Maarten.",
      "Legacy mockup describes a six-bedroom, six-bath waterfront luxury villa accommodating up to 12 guests.",
      "Legacy mockup emphasizes direct water views, designer interiors, and proximity to Maho and Simpson Bay.",
      "Group capacity, bedroom configuration, bath count, and any waterfront access/safety details require owner/source confirmation."
    ],
    assumptions: [
      "Photo rights, waterfront access rules, pool/beach/water safety, exact bed layout, rates, taxes, fees, minimum stays, and availability are unknown.",
      "Maho, Simpson Bay, and airport/noise proximity should be handled with owner-approved practical guidance before sharing.",
      "Luxury/designer language is migrated from the legacy mockup and should be grounded in actual photos/source before launch.",
      "No booking, inquiry, payment, calendar, or availability function is active in this preview."
    ],
    designBrief: "Design fingerprint: Sint Maarten waterfront palette with deep Caribbean blue, warm stone, crisp white, glassy interiors, and sunset accents. Tone should feel polished and group-practical, avoiding empty luxury adjectives. Guest promise: a confident villa plan for a large group that needs sleeping layout, gathering flow, waterfront expectations, and destination logistics before inquiry.",
    sections: [
      { kind: "heroImage", heroOnly: true, badges: ["Sint Maarten villa concept", "Read-only preview", "Owner-confirmed before launch"] },
      { kind: "stayFit", eyebrow: "Stay fit", title: "A large waterfront villa preview needs layout confidence first.", body: "The legacy concept positions Surfsong as a six-bedroom villa for up to 12 guests. The modern preview should make group planning concrete: who sleeps where, where everyone gathers, what water access means, and what to know about Maho/Maho Reef logistics.", items: [
        { label: "Observed", body: "Six bedrooms, six baths, waterfront setting, designer interiors, direct water views, and capacity up to 12 are stated in the legacy mockup." },
        { label: "Guest planning", body: "The finished page should clarify bedroom layout, arrival timing, parking, gathering spaces, and local movement between Beacon Hill, Maho, and Simpson Bay." },
        { label: "Owner confirmation", body: "Exact bedroom/bath layout, access rules, noise/airport context, pool/water safety, services, and policies must be confirmed." }
      ]},
      { kind: "signatureMoments", eyebrow: "Villa rhythm", title: "Sell the group flow, not just the view.", body: "A useful direct site should explain how a 10–12 person group actually uses the villa: morning coffee with water views, daytime beach or pool plans, flexible dining, evening gathering spaces, and quiet practical notes before booking." },
      { kind: "calendarMock", eyebrow: "Date-aware inquiry", title: "Collect the stay context a large villa owner actually needs.", body: "The preview keeps calendar behavior read-only, but the live concept would collect arrival/departure window, guest count, bedroom needs, celebrations/events, chef/service questions, and transportation needs before a response." },
      { kind: "priceComparison", eyebrow: "Trip-total clarity", title: "Structure the economics before promising savings.", body: "No real rates are shown here. Before launch, DirectStay would confirm base rates, taxes, service fees, deposits, event rules, and whether any direct-vs-marketplace comparison is appropriate." },
      { kind: "areaGuide", eyebrow: "Maho / Simpson Bay planning", title: "Destination guidance should be precise and owner-approved.", body: "Replace broad Sint Maarten copy with practical owner guidance: airport arrival, Maho Beach expectations, Simpson Bay restaurants, beaches, provisioning, car service, noise considerations, and day-trip recommendations.", items: ["Beacon Hill / Maho Reef orientation", "Airport and arrival logistics", "Waterfront / beach expectations", "Restaurants, provisioning, and group transport to confirm"] }
    ],
    callouts: [
      { label: "Migration source", body: "Built from the legacy Surfsong Villa static proof-of-concept. Treat all content as draft until owner/source confirmation." },
      { label: "Safety gate", body: "Do not share externally until photo rights, exact layout, water/pool rules, event policies, rates, taxes, fees, availability, and local claims are verified." },
      { label: "Removal path", body: "The legacy repo can be retired after this Preview Build packet is preserved and the workspace map is updated." }
    ]
  }
];

function artifactBody(title, lines) {
  return `${title}\n\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

async function upsertBuild(config) {
  const existingLead = await prisma.platformLead.findFirst({ where: { email: config.email }, include: { previewBuilds: true, artifacts: true } });
  const lead = existingLead
    ? await prisma.platformLead.update({ where: { id: existingLead.id }, data: {
      status: "QUALIFIED",
      fullName: config.owner,
      phone: config.phone,
      propertyName: config.propertyName,
      propertyLocation: config.location,
      currentWebsite: config.currentWebsite,
      goal: config.goal,
      source: "legacy-poc-migration",
      firstRead: `${config.propertyName} is a legacy static POC migrated into a modern internal Preview Build draft.`,
      nextAction: "Internal review only. Confirm source truth and owner rights before any external share; legacy repo may be retired after workspace evidence is committed."
    }})
    : await prisma.platformLead.create({ data: {
      status: "QUALIFIED",
      fullName: config.owner,
      email: config.email,
      phone: config.phone,
      propertyName: config.propertyName,
      propertyLocation: config.location,
      currentWebsite: config.currentWebsite,
      goal: config.goal,
      source: "legacy-poc-migration",
      firstRead: `${config.propertyName} is a legacy static POC migrated into a modern internal Preview Build draft.`,
      nextAction: "Internal review only. Confirm source truth and owner rights before any external share; legacy repo may be retired after workspace evidence is committed."
    }});

  const preview = await prisma.previewBuild.upsert({
    where: { slug: config.slug },
    update: {
      platformLeadId: lead.id,
      status: "DRAFT",
      propertyName: config.propertyName,
      location: config.location,
      sourceUrls: config.sourceUrls,
      heroTitle: config.heroTitle,
      positioning: config.positioning,
      sections: config.sections,
      ownerCallouts: config.callouts
    },
    create: {
      platformLeadId: lead.id,
      slug: config.slug,
      status: "DRAFT",
      propertyName: config.propertyName,
      location: config.location,
      sourceUrls: config.sourceUrls,
      heroTitle: config.heroTitle,
      positioning: config.positioning,
      sections: config.sections,
      ownerCallouts: config.callouts
    }
  });

  const artifacts = [
    ["PREVIEW_PHOTO_GEO_AUDIT", `Photo + Geography Audit — ${config.propertyName}`, `${artifactBody("Observed source facts", config.facts)}\n\nPhoto rights: no reusable source photos were preserved in the legacy POC migration. Use text-first preview until owner/public-source images are approved.\n\nGeography notes:\n${config.location}\n\nSource URLs:\n${config.sourceUrls.map((url) => `- ${url}`).join("\n")}`],
    ["PREVIEW_DESIGN_BRIEF", `Design Brief — ${config.propertyName}`, config.designBrief],
    ["PREVIEW_FACT_REGISTER", `Fact Register — ${config.propertyName}`, artifactBody("Migrated facts requiring source discipline", config.facts)],
    ["PREVIEW_ASSUMPTION_REGISTER", `Assumption Register — ${config.propertyName}`, artifactBody("Assumptions / owner-confirmation gaps", config.assumptions)],
    ["PREVIEW_SHARE_NOTE", `Owner-share Note Draft — ${config.propertyName}`, `Draft only. Do not send or share externally without Jaimal approval.\n\nSource basis: legacy DirectStay proof-of-concept files from the Bishop workspace, not owner-confirmed current material.\n\nFunctionality status: public-obscure noindex preview route; booking, inquiry, payment, login, calendar, and availability behavior are disabled/read-only.\n\nCorrection path: owner must be invited to correct/remove any claim, replace images, confirm policies, and approve launch content.\n\nRemoval path: owner may request that the preview be taken down/unshared before or after review.`],
    ["PREVIEW_RUBRIC_REVIEW", `Rubric Review Draft — ${config.propertyName}`, `Internal draft verdict: learning artifact / internal review draft, not owner-share candidate yet.\n\nCopy Review Stack:\n- Source-truth pass: limited to facts visible in the legacy POC; all operational/local/commercial claims are marked confirmation-needed.\n- VRBO-owner relevance pass: sections focus on guest planning, direct inquiry context, trip-total clarity, and owner correction gaps.\n- Guest usefulness pass: copy emphasizes layout, arrival/date questions, destination planning, and policy questions rather than generic luxury copy.\n- Anti-AI voice pass: avoided “seamless,” “unlock,” “curated,” and broad brochure filler where possible.\n- Section-fit pass: internal strategy and correction gaps are kept in owner callouts/artifacts; guest sections remain read-only and practical.\n\nBlockers before owner sharing: owner/source confirmation, image rights, exact layout/capacity, rules/safety, rates/fees/taxes, availability, local recommendations, visual QA.`],
    ["PREVIEW_CONVERSION_PACKET", `Preview Conversion Packet Draft — ${config.propertyName}`, `Conversion status: not ready for live site.\n\nRequired before promotion:\n- Owner-approved facts, photos, rates, fees, taxes, availability, rules, and policies.\n- Launch checklist complete.\n- Contract/commercial approval if this becomes a real DirectStay owner project.\n- Replace internal legacy-source references with owner-safe public/source notes.\n- Run desktop/mobile visual QA after final images are attached.`]
  ];

  for (const [type, title, body] of artifacts) {
    const existing = await prisma.platformLeadArtifact.findFirst({ where: { platformLeadId: lead.id, type } });
    if (existing) {
      await prisma.platformLeadArtifact.update({ where: { id: existing.id }, data: { status: "DRAFT", title, body, createdByEmail } });
    } else {
      await prisma.platformLeadArtifact.create({ data: { platformLeadId: lead.id, type, status: "DRAFT", title, body, createdByEmail } });
    }
  }

  return { leadId: lead.id, previewId: preview.id, slug: preview.slug };
}

try {
  const results = [];
  for (const build of builds) results.push(await upsertBuild(build));
  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  await prisma.$disconnect();
  await pool.end();
}
