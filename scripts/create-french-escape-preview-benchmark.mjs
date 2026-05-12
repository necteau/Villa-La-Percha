import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const writeRequested = args.has("--write");

if (!dryRun && !writeRequested) {
  throw new Error("Refusing to write Preview Build benchmark rows without --write. Use --dry-run to inspect the payload safely.");
}

const createdByEmail = "bishop@directstay.internal";

const config = {
  slug: "french-escape-at-the-lake-preview",
  owner: "Internal Lake Norman Benchmark",
  email: "french-escape-at-the-lake-preview@directstay.internal",
  phone: "+1-000-000-0000",
  propertyName: "French Escape at the Lake",
  location: "Lake Norman, North Carolina",
  currentWebsite: "https://www.frenchescapeatthelake.com/",
  sourceUrls: ["https://www.frenchescapeatthelake.com/"],
  goal: "Internal-only DirectStay Preview Build benchmark for a Lake Norman family/group dock-house use case. No owner-facing communication.",
  heroTitle: "French Escape at the Lake, planned around the way groups actually stay.",
  positioning: "A read-only DirectStay preview for a Lake Norman retreat, focused on sleeping layout, lake-day rhythm, date-aware inquiry, and the owner details guests need before they commit.",
  images: {
    hero: "https://static.wixstatic.com/media/1059de_a0b6de3bdad94ffd96d50067c98c9ab7f000.jpg/v1/fill/w_1920,h_921,al_c,q_85,enc_avif,quality_auto/1059de_a0b6de3bdad94ffd96d50067c98c9ab7f000.jpg",
    living: "https://static.wixstatic.com/media/1059de_54c8abf4b89d4f0dacc49d25f1e1ee16~mv2.jpg/v1/fill/w_1158,h_1012,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/tjqljs4zxk.jpg",
    hotTub: "https://static.wixstatic.com/media/1059de_1ff534c5b34d4cbf8528f43bfa72dc75~mv2.png/v1/crop/x_0,y_308,w_3024,h_3417/fill/w_610,h_562,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Hot%20Tub%2001_heic.png",
    kitchen: "https://static.wixstatic.com/media/1059de_94905ca89e35421ca465f7f2c7221275~mv2.jpg/v1/crop/x_0,y_195,w_1920,h_2169/fill/w_610,h_562,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_6264_edited.jpg",
    dock: "https://static.wixstatic.com/media/1059de_74840c6839134a6995e8d533b70c12ff~mv2.jpg/v1/crop/x_0,y_308,w_3024,h_3417/fill/w_610,h_562,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_1288.jpg",
    firePit: "https://static.wixstatic.com/media/1059de_ff2774c3e6b340f396037e094fb50562~mv2.png/v1/crop/x_0,y_308,w_3024,h_3417/fill/w_610,h_562,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/fire%20pit%202_HEIC.png",
  },
};

const sections = [
  { kind: "heroImage", heroOnly: true, imageUrl: config.images.hero, imageAlt: "French Escape at the Lake exterior at sunset", badges: ["Lake Norman group stay", "Read-only preview", "Owner-confirmed before launch"] },
  { kind: "stayFit", eyebrow: "Stay fit", title: "A lake house preview should answer group-planning questions first.", body: "French Escape is positioned as a Lake Norman retreat for families, friend weekends, celebrations, and corporate groups. The useful direct-booking story is not just the view; it is how twelve people sleep, gather, cook, use the lake, and ask the right questions before dates are held.", imageUrl: config.images.living, imageAlt: "Vaulted living room with fireplace and lake view", items: [
    { label: "Source-observed capacity", body: "The public site states sleeps up to 12, four bedrooms, three full bathrooms, two full kitchens, and multiple living areas." },
    { label: "Planning emphasis", body: "Guests should understand sleeping layout, dock and water expectations, parking and party-size needs, and which rules require owner confirmation." },
    { label: "Preview status", body: "This is a read-only preview. No booking, inquiry, payment, calendar, or availability function is active." }
  ]},
  { kind: "signatureMoments", eyebrow: "Lake-day rhythm", title: "Build the page around how the group moves through the day.", body: "Morning starts with kitchen and patio planning. Afternoons can center on the dock, kayaks, hot tub, and shaded reset spaces, subject to owner-confirmed rules. Evenings move toward dinner, fire-pit time, games, and movie-night space without making anyone guess where the group will fit.", imageUrl: config.images.dock, imageAlt: "Private dock and Lake Norman water view" },
  { kind: "propertyDetails", eyebrow: "Sleeping layout", title: "Make the bedroom plan plain before anyone asks.", body: "The source describes a primary king, a queen ensuite, a queen bedroom, a bunk-and-queen room, and a full sofa sleeper. A launch-ready version would confirm bed sizes, occupancy, bunk limits, bathroom access, linens, accessibility, and child-safety details with the owner before this appears as final guest copy.", imageUrl: config.images.kitchen, imageAlt: "Kitchen and dining detail in the lake house" },
  { kind: "amenitiesConfidence", eyebrow: "Amenity confidence", title: "Lake amenities need practical questions, not vague excitement.", body: "The source mentions a private dock, hot tub, kayaks, direct water access, a fire pit near the dock, and the possibility of bringing a boat or Jet Ski. Before any owner-share or launch, DirectStay would confirm the rules: dock depth, boat/PWC limits, kayak availability, life jackets, swim safety, hot-tub hours, quiet hours, waivers, and weather guidance.", imageUrl: config.images.hotTub, imageAlt: "Covered patio hot tub at night" },
  { kind: "calendarMock", eyebrow: "Date-aware inquiry", title: "Plan the right lake week before you inquire.", body: "A lake-house inquiry should collect preferred arrival and departure dates, party size, bedroom needs, children in the group, boat or Jet Ski plans, dock/kayak/hot-tub expectations, parking questions, and whether the stay is a quiet family trip or a celebration. Preview only — dates and availability are not live." },
  { kind: "priceComparison", eyebrow: "Trip-total clarity", title: "Show cost structure without inventing rates.", body: "No real rates are shown in this preview. A launch-ready version would separate lodging, cleaning, taxes, deposits, owner fees, pet or equipment assumptions, and marketplace/service-fee comparisons only after the owner approves the pricing basis and savings language." },
  { kind: "areaGuide", eyebrow: "Lake Norman planning", title: "The local guide should behave like an arrival plan.", body: "Until owner favorites are confirmed, the guide should use categories instead of exact claims: grocery and arrival stops, marina or boat-ramp logistics, waterfront dining and coffee favorites to collect, rainy-day Lake Norman or Charlotte backups, and house-specific quiet-hour and safety reminders.", imageUrl: config.images.firePit, imageAlt: "Fire pit near the lake at dusk", items: [
    "Arrival, groceries, parking, and first-night setup.",
    "Dock, marina, boat/PWC, kayak, and swim-safety questions to confirm.",
    "Waterfront restaurants, coffee, and rainy-day ideas to collect from the owner.",
    "Celebration boundaries, quiet hours, pets, accessibility, and child-safety notes."
  ]},
  { kind: "directBookingValue", eyebrow: "Owner-correction path", title: "This preview should invite corrections before it sells anything.", body: "The owner-review packet should ask for preferred hero images, exact sleeping layout, lake and dock rules, hot-tub and event policies, rates, taxes, fees, cancellation terms, local recommendations, and any claims that should be removed. That correction path is the product: a safer, clearer direct booking asset built from owner-approved details." }
];

const callouts = [
  { label: "Internal benchmark only", body: "Created from public source review for DirectStay Preview Build quality refinement. Do not send or share externally without Jaimal approval." },
  { label: "Owner confirmation required", body: "Photo rights, sleeping layout, dock/boat/PWC/kayak/swim rules, hot tub rules, event boundaries, parking, pets, accessibility, rates, taxes, fees, availability, cancellation terms, and local recommendations all need owner confirmation." },
  { label: "Image integrity", body: "Rendered image order uses distinct property images for hero, living area, dock, kitchen, hot tub, and fire pit. OTA logos, social icons, Superhost badges, and promotional cards were rejected." }
];

const facts = [
  "Public site describes French Escape at the Lake as a Lake Norman lakefront vacation rental near Charlotte.",
  "Source-observed amenities include private dock, hot tub, kayaks, direct water access, and fire pit near the dock.",
  "Source says guests may bring a boat or Jet Ski and keep it at the private dock, but operational/legal/safety details need owner confirmation.",
  "Source positioning includes family vacations, weekend getaways, group trips, celebrations, bachelorette/birthday groups, and corporate retreats.",
  "Source states ranch-style retreat, open-concept layout, screened patio, game room, movie/theater-sound setup, two full kitchens, multiple living areas.",
  "Source states sleeps up to 12, four bedrooms, three full bathrooms.",
  "Source-observed sleeping layout: primary king, queen ensuite, queen bedroom, bunk + queen bedroom, full sofa sleeper.",
  "Source states a 275 lb max limit on bunk beds."
];

const assumptions = [
  "Exact address, exact drive times, dock depth, launch logistics, boat/PWC legality, waivers, swim safety, kayak quantity/condition, hot-tub capacity/rules, parking count, pet policy, accessibility, child-safety features, rates, taxes, fees, deposits, availability, and cancellation terms are unknown.",
  "Any direct-vs-marketplace savings language is illustrative only until owner-approved pricing and comparison assumptions exist.",
  "Public source images are suitable for internal benchmark rendering only; rights and preferred image order must be confirmed before owner-share or launch.",
  "No booking, inquiry, payment, calendar, or availability function is active in this preview."
];

const artifacts = [
  {
    type: "PREVIEW_PHOTO_GEO_AUDIT",
    title: "Photo + Geography Audit — French Escape at the Lake",
    body: `${bulletList("Source-backed facts", facts)}\n\nImage plan:\n- Hero: exterior/lake-house sunset.\n- First visible section: living room/fireplace/lake view.\n- Early rhythm: dock/lake view, kitchen/dining detail, hot tub, fire pit.\n- Rejected: OTA logos, social icons, Superhost badge, promotional graphics, and unverifiable filler.\n\nGeography discipline:\n- Use Lake Norman / near Charlotte only unless exact address or drive times are owner-confirmed.\n- Avoid named restaurants, marina claims, water-depth claims, dock legal claims, or exact distances until verified.`,
    metadata: { sourceUrls: config.sourceUrls, images: config.images },
  },
  { type: "PREVIEW_DESIGN_BRIEF", title: "Design Brief — French Escape at the Lake", body: "Design fingerprint: polished Lake Norman group retreat with warm sunset neutrals, lake blue/green, white cabinetry, stone fireplace, and practical hosting confidence. Tone should feel like a guest planning page, not a strategy memo. Lead with trip confidence: where people sleep, how lake days work, what needs confirming before booking, and how a direct inquiry reduces back-and-forth." },
  { type: "PREVIEW_FACT_REGISTER", title: "Fact Register — French Escape at the Lake", body: bulletList("Observed facts to preserve", facts) },
  { type: "PREVIEW_ASSUMPTION_REGISTER", title: "Assumption Register — French Escape at the Lake", body: bulletList("Assumptions / owner-confirmation gaps", assumptions) },
  { type: "PREVIEW_SHARE_NOTE", title: "Owner-share Note Draft — French Escape at the Lake", body: "Draft only. Do not send or share externally without Jaimal approval.\n\nThis benchmark was created from public source review to test DirectStay Preview Build quality. Before any owner-facing use, the owner must be invited to correct/remove claims, approve images, confirm policies and pricing, and approve whether any direct-vs-marketplace comparison may be shown.\n\nFunctionality status: noindex public-obscure preview route; booking, inquiry, payment, calendar, and availability behavior are disabled/read-only." },
  { type: "PREVIEW_RUBRIC_REVIEW", title: "Rubric Review — French Escape at the Lake", body: "Score draft after source/image gate:\n\n- Property-specific design fingerprint: 4 — Lake Norman group-retreat rhythm is distinct and grounded in source details.\n- Visual fit to photos/location: 4 — distinct actual-property image sequence; no logos/badges/promotional cards used; rights remain unconfirmed.\n- Calendar/date module fit: 4 — lake-week, children, bedroom, dock/equipment, parking, and celebration-context questions fit the property type.\n- Price/savings module safety: 4 — structure-only, no real rates, no guaranteed savings.\n- Area-guide usefulness: 4 — organized around arrival, dock/marina, dining, rainy-day, rules/safety; exact recommendations intentionally withheld.\n- Owner-callout clarity: 4 — confirmation gaps are explicit and hidden from guest view.\n- Generic-template risk: 3.5 — materially property-aware; renderer styling and sample calendar/price components remain generic.\n- Technical polish: pending live/mobile QA.\n\nVerdict: suitable internal benchmark candidate after live route checks; not owner-share or launch-ready." },
  { type: "PREVIEW_CONVERSION_PACKET", title: "Preview Conversion Packet Draft — French Escape at the Lake", body: "Conversion status: not ready for live site.\n\nRequired before promotion:\n- Owner-approved facts, photos, rates, fees, taxes, deposits, availability, rules, and policies.\n- Remove/confirm all dock, boat/PWC, kayak, swim, event, pet, parking, accessibility, and safety claims.\n- Replace sample calendar and illustrative price module with approved controls/data or keep them disabled.\n- Complete desktop/mobile visual QA and final anti-AI/source-truth copy review.\n- Jaimal approval before any external share or owner communication." },
];

function bulletList(title, lines) {
  return `${title}\n\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

async function upsertArtifact(prisma, platformLeadId, type, title, body, metadata = undefined) {
  const existing = await prisma.platformLeadArtifact.findFirst({ where: { platformLeadId, type } });
  const data = { status: "DRAFT", title, body, createdByEmail, metadata };
  if (existing) return prisma.platformLeadArtifact.update({ where: { id: existing.id }, data });
  return prisma.platformLeadArtifact.create({ data: { platformLeadId, type, ...data } });
}

async function main() {
  if (dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      writeRequiredFlag: "--write",
      lead: { email: config.email, propertyName: config.propertyName, sourceUrls: config.sourceUrls },
      preview: { slug: config.slug, heroTitle: config.heroTitle, sectionCount: sections.length, ownerCalloutCount: callouts.length },
      artifacts: artifacts.map(({ type, title }) => ({ type, title })),
      url: `https://directstay.app/p/${config.slug}?view=guest`,
    }, null, 2));
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required for --write");

  const pool = new pg.Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
  const existingLead = await prisma.platformLead.findFirst({ where: { email: config.email } });
  const leadData = {
    status: "QUALIFIED",
    fullName: config.owner,
    phone: config.phone,
    propertyName: config.propertyName,
    propertyLocation: config.location,
    currentWebsite: config.currentWebsite,
    goal: config.goal,
    source: "internal-preview-benchmark",
    firstRead: "Internal Lake Norman Preview Build benchmark created from public-source review; no owner communication sent.",
    nextAction: "Internal QA and rubric scoring only. Do not share externally; use findings to refine Preview Build playbook and Villa La Percha launch workflow."
  };
  const lead = existingLead
    ? await prisma.platformLead.update({ where: { id: existingLead.id }, data: leadData })
    : await prisma.platformLead.create({ data: { ...leadData, email: config.email } });

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
      sections,
      ownerCallouts: callouts,
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
      sections,
      ownerCallouts: callouts,
    }
  });

  for (const artifact of artifacts) {
    await upsertArtifact(prisma, lead.id, artifact.type, artifact.title, artifact.body, artifact.metadata);
  }

  console.log(JSON.stringify({ ok: true, leadId: lead.id, previewId: preview.id, slug: preview.slug, url: `https://directstay.app/p/${preview.slug}?view=guest` }, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

await main();
