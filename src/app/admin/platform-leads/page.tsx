import Link from "next/link";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLeads } from "@/lib/platformLeads";

type QueueView = "all" | "needs-first-read" | "needs-approval" | "follow-up-due" | "preview-in-progress" | "proposal-ready" | "spam-review";

type AdminPlatformLeadsPageProps = {
  searchParams?: Promise<{ view?: string }>;
};

const QUEUE_VIEWS: Array<{ key: QueueView; label: string; description: string }> = [
  { key: "all", label: "All latest", description: "Newest PlatformLead records." },
  { key: "needs-first-read", label: "Needs first read", description: "New leads without a first-read summary." },
  { key: "needs-approval", label: "Needs approval", description: "Draft artifacts waiting on Jaimal approval." },
  { key: "follow-up-due", label: "Follow-up due", description: "Leads with follow-ups due today or earlier." },
  { key: "preview-in-progress", label: "Preview in progress", description: "Preview builds not yet shared or promoted." },
  { key: "proposal-ready", label: "Proposal-ready", description: "Qualified/contacted leads ready for proposal thinking." },
  { key: "spam-review", label: "Spam review", description: "Suspicious/spam leads kept recoverable." },
];

const PREVIEW_BENCHMARKS = [
  {
    property: "Savannah Broughton Street carriage house",
    archetype: "Urban / historic district",
    status: "Reworked internal benchmark",
    evidence: "Dedicated hero, promotional assets removed, garage/walkable-city narrative, desktop/mobile QA green.",
    blockers: "Photo rights, rates/fees/taxes, availability, occupancy, parking/pool rules, local recommendations, owner review.",
  },
  {
    property: "Asheville Shope Creek cabin",
    archetype: "Mountain / forest cabin",
    status: "Reworked internal benchmark",
    evidence: "Cross-property badge bleed and hero repeat fixed; Shope Creek/deck/hot-tub/group-weekend rhythm; desktop/mobile QA green.",
    blockers: "Photo rights, exact sleeping/bath/occupancy/rules, rates/fees/taxes, availability, owner local recommendations.",
  },
  {
    property: "French Escape At The Lake",
    archetype: "Lake Norman family/group dock house",
    status: "Rendered internal benchmark",
    evidence: "Strong lake-house planning model with source-backed image sequence and dock/equipment questions.",
    blockers: "Photo rights, sleeping layout, dock/boat/PWC/kayak/swim rules, hot-tub/event/parking/pet/accessibility policies, rates/fees/taxes, availability, local recommendations.",
  },
  {
    property: "Sarasota River Retreat",
    archetype: "Gulf Coast riverfront retreat",
    status: "Image-source review complete; no render",
    evidence: "One confirmed property-specific living-room image; river/pool/dock/kayak exterior art not confirmed, with most other assets local/stock/attraction images.",
    blockers: "Full owner/gallery photo set, photo rights, safe exterior/amenity hero, water/pool/spa/kayak rules, rates/policies, owner recommendations.",
  },
] as const;

function normalizeView(value: string | undefined): QueueView {
  return QUEUE_VIEWS.some((view) => view.key === value) ? (value as QueueView) : "all";
}

function isFollowUpDue(value: Date | null) {
  if (!value) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return value <= today;
}

function leadMatchesView(lead: Awaited<ReturnType<typeof getAdminPlatformLeads>>[number], view: QueueView) {
  switch (view) {
    case "needs-first-read":
      return !lead.firstRead && !["SPAM", "ARCHIVED", "CONVERTED"].includes(lead.status);
    case "needs-approval":
      return lead.artifacts.some((artifact) => artifact.status === "NEEDS_APPROVAL");
    case "follow-up-due":
      return isFollowUpDue(lead.nextFollowUpAt) && !["SPAM", "ARCHIVED", "CONVERTED", "UNQUALIFIED"].includes(lead.status);
    case "preview-in-progress":
      return lead.previewBuilds.some((preview) => ["DRAFT", "READY_FOR_REVIEW"].includes(preview.status));
    case "proposal-ready":
      return ["CONTACTED", "QUALIFIED"].includes(lead.status) && !lead.artifacts.some((artifact) => artifact.type === "PROPOSAL_DRAFT" && !["REJECTED", "SUPERSEDED"].includes(artifact.status));
    case "spam-review":
      return ["SUSPICIOUS", "SPAM"].includes(lead.status);
    case "all":
    default:
      return true;
  }
}

function formatShortDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function queueTone(view: QueueView) {
  if (["needs-approval", "follow-up-due"].includes(view)) return "admin-chip admin-chip-warn";
  if (["spam-review"].includes(view)) return "admin-chip admin-chip-danger";
  return "admin-chip";
}

export default async function AdminPlatformLeadsPage({ searchParams }: AdminPlatformLeadsPageProps) {
  const admin = await getAdminSession();
  const params = await searchParams;
  const activeView = normalizeView(params?.view);
  const leads = await getAdminPlatformLeads();
  const visibleLeads = leads.filter((lead) => leadMatchesView(lead, activeView));
  const counts = Object.fromEntries(QUEUE_VIEWS.map((view) => [view.key, leads.filter((lead) => leadMatchesView(lead, view.key)).length])) as Record<QueueView, number>;
  const activeQueue = QUEUE_VIEWS.find((view) => view.key === activeView) ?? QUEUE_VIEWS[0];

  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_leads", entityType: "PlatformLead", metadata: { count: leads.length, visibleCount: visibleLeads.length, view: activeView } });

  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">Owner acquisition</p><h2>Platform Leads</h2><p>DirectStay business-development prospects from the public owner intake funnel.</p></div><span className="admin-chip">{visibleLeads.length} shown / {leads.length} latest</span></header>

      <section className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-section-head"><div><p className="admin-eyebrow">Queue views</p><h3>{activeQueue.label}</h3><p>{activeQueue.description}</p></div><span className={queueTone(activeView)}>{counts[activeView]}</span></div>
        <div className="admin-actions" style={{ flexWrap: "wrap", marginTop: 12 }}>
          {QUEUE_VIEWS.map((view) => (
            <Link key={view.key} className={view.key === activeView ? "admin-button" : "admin-button admin-button-secondary"} href={view.key === "all" ? "/admin/platform-leads" : `/admin/platform-leads?view=${view.key}`}>
              {view.label} <span className="admin-muted">{counts[view.key]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-card" style={{ marginBottom: 18 }}>
        <div className="admin-section-head"><div><p className="admin-eyebrow">Preview build lab</p><h3>Benchmark handoff</h3><p>Internal archetype status from the latest refinement pass. These are not owner-share approvals.</p></div><Link className="admin-button admin-button-secondary" href="/admin/platform-leads?view=preview-in-progress">Open preview queue</Link></div>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}><table className="admin-table"><thead><tr><th>Benchmark</th><th>Status</th><th>Useful evidence</th><th>Owner-share blockers</th></tr></thead><tbody>
          {PREVIEW_BENCHMARKS.map((benchmark) => <tr key={benchmark.property}><td>{benchmark.property}<br/><span className="admin-muted">{benchmark.archetype}</span></td><td><span className={benchmark.status.includes("do not render") ? "admin-chip admin-chip-warn" : "admin-chip"}>{benchmark.status}</span></td><td>{benchmark.evidence}</td><td>{benchmark.blockers}</td></tr>)}
        </tbody></table></div>
        <p className="admin-muted" style={{ marginTop: 10 }}>Next safe chunk: Sarasota can only render as an internal, text-forward or living-room-first benchmark; do not use skyline/canal/attraction images as property hero or fabricate river, pool, wildlife, beach-distance, kayak, or restaurant claims.</p>
      </section>

      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Lead</th><th>Status</th><th>Property</th><th>Owner ops</th><th>Latest AI artifact</th><th>Preview</th><th>Created</th></tr></thead><tbody>
        {visibleLeads.map((lead) => {
          const followUp = formatShortDate(lead.nextFollowUpAt);
          const latestArtifact = lead.artifacts[0];
          const latestPreview = lead.previewBuilds[0];
          return <tr key={lead.id}><td><Link href={`/admin/platform-leads/detail?leadId=${lead.id}`}>{lead.fullName}</Link><br/><span className="admin-muted">{lead.email}</span></td><td><span className="admin-chip">{lead.status}</span></td><td>{lead.propertyName || lead.company || "—"}<br/><span className="admin-muted">{lead.propertyLocation || "—"}</span></td><td>{lead.assignedToUserId ? <span className="admin-chip">Assigned</span> : <span className="admin-muted">Unassigned</span>}<br/><span className="admin-muted">{followUp ? `Follow up ${followUp}` : lead.nextAction || "No next action"}</span>{lead.firstRead ? null : <><br/><span className="admin-chip admin-chip-warn">Needs first read</span></>}</td><td>{latestArtifact ? <><span className={latestArtifact.status === "NEEDS_APPROVAL" ? "admin-chip admin-chip-warn" : "admin-chip"}>{latestArtifact.status.replaceAll("_", " ")}</span><br/><span className="admin-muted">{latestArtifact.type.replaceAll("_", " ")}</span></> : <span className="admin-muted">No artifact</span>}</td><td>{latestPreview ? <><span className="admin-chip">{latestPreview.status.replaceAll("_", " ")}</span><br/><Link href={`/p/${latestPreview.slug}`}>/{latestPreview.slug}</Link></> : <span className="admin-muted">No preview</span>}</td><td>{lead.createdAt.toISOString().slice(0,10)}</td></tr>;
        })}
        {visibleLeads.length === 0 ? <tr><td colSpan={7}><span className="admin-muted">No PlatformLeads match this queue view.</span></td></tr> : null}
      </tbody></table></div>
    </div>
  );
}
