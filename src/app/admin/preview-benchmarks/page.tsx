import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";

const benchmarks = [
  {
    name: "Savannah Broughton Street carriage house",
    archetype: "Urban / historic-district stay",
    status: "Reworked internal benchmark",
    evidence: "Dedicated hero, promotional assets removed, private-garage/walkable-city narrative, desktop/mobile QA green.",
    blockers: "Photo rights, rates/fees/taxes, availability, occupancy, parking/pool rules, local recommendations, owner review.",
  },
  {
    name: "Asheville Shope Creek cabin",
    archetype: "Mountain / forest cabin",
    status: "Reworked internal benchmark",
    evidence: "Savannah badge bleed fixed, hero repeat fixed, Shope Creek/deck/hot-tub/group-weekend rhythm, desktop/mobile QA green.",
    blockers: "Photo rights, exact sleeping/bath/occupancy/rules, rates/fees/taxes, availability, owner local recommendations.",
  },
  {
    name: "French Escape At The Lake",
    archetype: "Lake Norman family/group dock house",
    status: "Rendered internal benchmark",
    evidence: "Strong lake-house planning model: sleeping/layout confidence, dock/equipment questions, structure-only trip-total module, source-backed property image sequence.",
    blockers: "Photo rights, exact sleeping layout, dock/boat/PWC/kayak/swim rules, hot-tub/event/parking/pet/accessibility policies, rates/fees/taxes, availability, cancellation terms, local recommendations.",
  },
  {
    name: "Sarasota River Retreat",
    archetype: "Gulf Coast riverfront retreat",
    status: "Image-source review complete; no render",
    evidence: "Owner prose shows a distinct river/canal archetype. HTML/image inspection found one confirmed property-specific living-room image; river/pool/dock/kayak exterior art was not confirmed.",
    blockers: "Full owner/gallery photo set, photo rights, safe exterior/amenity hero, water/pool/spa/kayak rules, rates/policies, owner recommendations.",
  },
];

const standards = [
  "Choose hero + first two section images from an inspected page-order inventory; reject promotional cards, overlays, collages, review graphics, OTA banners, and unknown filler.",
  "Calendar, price, and area-guide modules should answer property-specific guest-planning questions before explaining DirectStay strategy.",
  "Use text-only sections when local/property imagery is thin, and record the owner photo request instead of filling with unsafe images.",
  "Run the bad-copy scan against rendered guest view and remove internal/process language before scoring.",
  "Keep owner-share blockers separate from benchmark score: a strong internal benchmark can still need photo, policy, rate, availability, tax, or local-claim confirmation.",
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
        <span className="admin-chip">{benchmarks.length} benchmarks</span>
      </header>

      <section className="admin-card admin-section">
        <h3>Current quality standards</h3>
        <ul className="admin-list">
          {standards.map((standard) => <li key={standard}>{standard}</li>)}
        </ul>
      </section>

      <div className="admin-table-wrap admin-section">
        <table className="admin-table admin-activity-table">
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Archetype</th>
              <th>Status</th>
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
                <td>{benchmark.evidence}</td>
                <td>{benchmark.blockers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
