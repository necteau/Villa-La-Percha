import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLead } from "@/lib/platformLeads";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return <p><span className="admin-muted">{label}:</span> {value || "—"}</p>;
}

export default async function AdminPlatformLeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const admin = await getAdminSession();
  const lead = await getAdminPlatformLead(leadId);
  if (!lead) notFound();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_lead", entityType: "PlatformLead", entityId: lead.id });

  return (
    <div>
      <header className="admin-page-head"><div><p className="admin-eyebrow">PlatformLead detail</p><h2>{lead.fullName}</h2><p>{lead.email} · created {lead.createdAt.toISOString().slice(0,10)}</p></div><span className="admin-chip">{lead.status}</span></header>
      <section className="admin-detail-grid">
        <article className="admin-card"><h3>Contact</h3><Field label="Name" value={lead.fullName} /><Field label="Email" value={lead.email} /><Field label="Phone" value={lead.phone} /><Field label="Company" value={lead.company} /><code>{lead.id}</code></article>
        <article className="admin-card"><h3>Property</h3><Field label="Location" value={lead.propertyLocation} /><Field label="Property count" value={lead.propertyCount} /><Field label="Current website / OTA" value={lead.currentWebsite} /><Field label="Desired domain" value={lead.desiredCustomDomain} /></article>
      </section>
      <section className="admin-detail-grid admin-section">
        <article className="admin-card"><h3>Operations</h3><Field label="PMS / channel manager" value={lead.pms} /><Field label="Launch timeline" value={lead.launchTimeline} /><Field label="Source" value={lead.source} /></article>
        <article className="admin-card"><h3>Goal</h3><p>{lead.goal || "—"}</p>{lead.message ? <><h3>Message</h3><p>{lead.message}</p></> : null}</article>
      </section>
    </div>
  );
}
