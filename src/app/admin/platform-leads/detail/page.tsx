import { notFound } from "next/navigation";
import type { PlatformLeadStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLead } from "@/lib/platformLeads";

const PLATFORM_LEAD_STATUSES: PlatformLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "CONVERTED",
  "UNQUALIFIED",
  "ARCHIVED",
];

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return <p><span className="admin-muted">{label}:</span> {value || "—"}</p>;
}

export default async function AdminPlatformLeadDetailPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await searchParams;
  if (!leadId) notFound();
  const admin = await getAdminSession();
  const lead = await getAdminPlatformLead(leadId);
  if (!lead) notFound();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_lead", entityType: "PlatformLead", entityId: lead.id });

  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">PlatformLead detail</p><h2>{lead.fullName}</h2><p>{lead.email} · created {lead.createdAt.toISOString().slice(0,10)}</p></div><span className="admin-chip">{lead.status}</span></header>
      <section className="admin-detail-grid">
        <article className="admin-card"><h3>Contact</h3><Field label="Name" value={lead.fullName} /><Field label="Email" value={lead.email} /><Field label="Phone" value={lead.phone} /><code>{lead.id}</code></article>
        <article className="admin-card"><h3>Property</h3><Field label="Property name" value={lead.propertyName || lead.company} /><Field label="Location" value={lead.propertyLocation} /><Field label="Current website / OTA" value={lead.currentWebsite} /></article>
      </section>
      <section className="admin-detail-grid admin-section">
        <article className="admin-card"><h3>Triage</h3><form action="/admin/platform-leads/status" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><label className="admin-muted" htmlFor="status">Lead status</label><select id="status" name="status" defaultValue={lead.status}>{PLATFORM_LEAD_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select><button type="submit">Update status</button></form></article>
        <article className="admin-card"><h3>Source</h3><Field label="Source" value={lead.source} /><Field label="Legacy company / brand" value={lead.company} /><Field label="Legacy desired domain" value={lead.desiredCustomDomain} /></article>
        <article className="admin-card"><h3>Message</h3><p>{lead.message || "—"}</p></article>
      </section>
    </div>
  );
}
