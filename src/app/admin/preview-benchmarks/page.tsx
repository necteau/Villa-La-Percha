import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";

const sourceDoc = "directstay/docs/platform-leads/preview-build-benchmark-status-2026-05-11.md";
const updatedAt = "2026-05-16";

const benchmarks = [
  {
    name: "Savannah Broughton Street carriage house",
    archetype: "Urban / historic-district stay",
    status: "Reworked internal benchmark",
    verdict: "Jaimal/internal review example",
    evidence: "Dedicated hero, promotional assets removed, private-garage/walkable-city narrative, desktop/mobile QA green.",
    blockers: "Photo rights, rates/fees/taxes, availability, occupancy, parking/pool rules, local recommendations, owner review.",
  },
  {
    name: "Asheville Shope Creek cabin",
    archetype: "Mountain / forest cabin",
    status: "Reworked internal benchmark",
    verdict: "Jaimal/internal review example",
    evidence: "Savannah badge bleed fixed, hero repeat fixed, Shope Creek/deck/hot-tub/group-weekend rhythm, desktop/mobile QA green.",
    blockers: "Photo rights, exact sleeping/bath/occupancy/rules, rates/fees/taxes, availability, owner local recommendations.",
  },
  {
    name: "French Escape At The Lake",
    archetype: "Lake Norman family/group dock house",
    status: "Rendered internal benchmark",
    verdict: "Internal learning/reference example",
    evidence: "Strong lake-house planning model: sleeping/layout confidence, dock/equipment questions, structure-only trip-total module, source-backed property image sequence.",
    blockers: "Photo rights, exact sleeping layout, dock/boat/PWC/kayak/swim rules, hot-tub/event/parking/pet/accessibility policies, rates/fees/taxes, availability, cancellation terms, local recommendations.",
  },
  {
    name: "Sarasota River Retreat",
    archetype: "Gulf Coast riverfront retreat",
    status: "Internal-only local fixture and post-render score complete",
    verdict: "Learning artifact only",
    evidence: "Text-forward fixture, living-room trust image, QA/visual evidence, post-render rubric score, and three-archetype synthesis rerun are complete. Still depends on source-safe exterior/amenity images and owner-confirmed operating facts before owner review.",
    blockers: "Full owner/gallery photo set, photo rights, safe exterior/amenity hero, water/pool/spa/kayak rules, rates/policies, owner recommendations.",
  },
  {
    name: "Circle Home / Carolina Beach",
    archetype: "Round beach house",
    status: "Three-archetype synthesis rerun complete",
    verdict: "Updated benchmark candidate",
    evidence: "Rerun selected Family Beach Logistics as the base, synthesized Round House Beach Week Planner, and raised the candidate from 31/50 to 46/50. Static Preview Build QA, benchmark index QA, and lint passed after DB update.",
    blockers: "Photo rights, owner-confirmed rates/fees/taxes, availability, rules, local recommendations, and production deploy freshness for any renderer-only fixes.",
  },
  {
    name: "Surfsong Villa",
    archetype: "Sint Maarten waterfront villa",
    status: "Internal visible-candidate fixture complete",
    verdict: "Internal learning/reference example",
    evidence: "Saint Martin Rentals imagery passed the internal image gate, three-archetype synthesis selected Waterfront Group-Stay Planner at 45/50, and the local Surfsong fixture now renders a read-only group-stay planner with three distinct inspected images.",
    blockers: "Photo rights/owner approval, exact bed configuration, waterfront/swim/safety rules, pool/hot-tub status, airport/noise context, rates/fees/taxes, minimum stay, cancellation/payment terms, and owner recommendations.",
  },
  {
    name: "Paradise Point Exuma",
    archetype: "Exuma waterfront villa",
    status: "Image-blocked",
    verdict: "Do not render until credible image source exists",
    evidence: "Tripadvisor evidence exists, but fetch access did not expose clean usable image URLs and the legacy PreviewBuild has a hero image section without an image URL.",
    blockers: "Usable owner/manager/right-safe property photos before any three-direction creative review or visible Preview Build promotion.",
  },
];

const standards = [
  "Choose hero + first two section images from an inspected page-order inventory; reject promotional cards, overlays, collages, review graphics, OTA banners, and unknown filler.",
  "Calendar, price, and area-guide modules should answer property-specific guest-planning questions before explaining DirectStay strategy.",
  "Use text-only sections when local/property imagery is thin, and record the owner photo request instead of filling with unsafe images.",
  "Run the bad-copy scan against rendered guest view and remove internal/process language before scoring.",
  "Keep owner-share blockers separate from benchmark score: a strong internal benchmark can still need photo, policy, rate, availability, tax, or local-claim confirmation.",
  "Every benchmark cited as a quality example needs three-direction synthesis, a selected base, a borrow-from-losing-variants note, and a synthesized score.",
];

const promotionGate = [
  "Inspect the latest rendered guest page, not only stored artifact data.",
  "Record page-order image inventory and first-screen distinction for hero plus first two content sections.",
  "Search guest-visible copy for benchmark/process language and cross-property badge or copy bleed.",
  "Confirm calendar, price, and area-guide modules read as guest planning help for that exact stay.",
  "Score the reworked version and keep owner-share blockers separate from the benchmark score.",
];

const nextSafeChunks = [
  "Run post-render desktop/mobile QA against the Surfsong local candidate before any READY_FOR_REVIEW or owner-share consideration.",
  "Do not use Paradise Point Exuma for a visible candidate until clean owner/manager/right-safe property photos exist.",
  "Future benchmarks should start by checking this index plus the source benchmark status doc before generating or scoring copy.",
];

export default async function AdminPreviewBenchmarksPage() {
  const admin = await getAdminSession();
  await recordAdminAuditEvent({
    actor: admin,
    action: "admin.read.preview_benchmarks",
    entityType: "PreviewBuildBenchmark",
    metadata: { count: benchmarks.length },
  });

  return (
    <div>
      <header className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Internal refinement lab</p>
          <h2>Preview Build Benchmarks</h2>
          <p>Read-only status index for DirectStay preview archetypes, quality evidence, and owner-share blockers. Use this before starting a new Preview Build so work begins from the latest benchmark lessons.</p>
        </div>
        <div className="admin-stack-right">
          <span className="admin-chip">{benchmarks.length} benchmarks</span>
          <span className="admin-muted">Updated {updatedAt}</span>
        </div>
      </header>

      <section className="admin-card admin-section">
        <h3>Current quality standards</h3>
        <ul className="admin-list">
          {standards.map((standard) => <li key={standard}>{standard}</li>)}
        </ul>
        <p className="admin-muted">Source: <code>{sourceDoc}</code></p>
      </section>

      <div className="admin-table-wrap admin-section">
        <table className="admin-table admin-activity-table">
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Archetype</th>
              <th>Status</th>
              <th>Promotion verdict</th>
              <th>Latest useful evidence</th>
              <th>Not owner-share ready until</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((benchmark) => (
              <tr key={benchmark.name}>
                <td>{benchmark.name}</td>
                <td>{benchmark.archetype}</td>
                <td><span className="admin-chip">{benchmark.status}</span></td>
                <td>{benchmark.verdict}</td>
                <td>{benchmark.evidence}</td>
                <td>{benchmark.blockers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="admin-grid admin-benchmark-grid admin-section">
        <article className="admin-card">
          <h3>Promotion gate reminder</h3>
          <ul className="admin-list">
            {promotionGate.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="admin-card">
          <h3>Next safe Preview Lab chunks</h3>
          <ul className="admin-list">
            {nextSafeChunks.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>
    </div>
  );
}
