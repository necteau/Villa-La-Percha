import Link from "next/link";
import { notFound } from "next/navigation";
import type { ContractExecutionStatus, PlatformLeadArtifactStatus, PlatformLeadArtifactType, PlatformLeadStatus, PreviewBuildStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLead } from "@/lib/platformLeads";

const PLATFORM_LEAD_STATUSES: PlatformLeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "UNQUALIFIED", "SUSPICIOUS", "SPAM", "ARCHIVED"];
const ARTIFACT_TYPES: PlatformLeadArtifactType[] = ["LEAD_BRIEF", "FIRST_RESPONSE_DRAFT", "PROPOSAL_RATIONALE", "PROPOSAL_DRAFT", "ONBOARDING_BRIEF", "ONBOARDING_EMAIL_DRAFT"];
const ARTIFACT_STATUSES: PlatformLeadArtifactStatus[] = ["DRAFT", "NEEDS_APPROVAL", "APPROVED", "SENT", "REJECTED", "SUPERSEDED"];
const PREVIEW_STATUSES: PreviewBuildStatus[] = ["DRAFT", "READY_FOR_REVIEW", "SHARED_WITH_LEAD", "PROMOTED_TO_SITE", "ARCHIVED"];
const CONTRACT_STATUSES: ContractExecutionStatus[] = ["NOT_STARTED", "DRAFTED", "SENT", "SIGNED", "COUNTERSIGNED", "VOIDED"];

function Field({ label, value }: { label: string; value?: string | number | null }) { return <p><span className="admin-muted">{label}:</span> {value || "—"}</p>; }
function money(cents?: number | null) { return cents == null ? "" : String(cents); }
function assignmentLabel(lead: { assignedToUserId?: string | null }, admin: { id: string; email: string }) {
  if (!lead.assignedToUserId) return "Unassigned";
  return lead.assignedToUserId === admin.id ? `Assigned to me (${admin.email})` : `Assigned user ${lead.assignedToUserId}`;
}

export default async function AdminPlatformLeadDetailPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await searchParams;
  if (!leadId) notFound();
  const admin = await getAdminSession();
  if (!admin) notFound();
  const lead = await getAdminPlatformLead(leadId);
  if (!lead) notFound();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_lead", entityType: "PlatformLead", entityId: lead.id });

  return <div>
    <header className="admin-page-head"><div><p className="admin-eyebrow">AI-led PlatformLead detail</p><h2>{lead.fullName}</h2><p>{lead.email} · created {lead.createdAt.toISOString().slice(0,10)}</p></div><span className="admin-chip">{lead.status}</span></header>
    <section className="admin-detail-grid">
      <article className="admin-card"><h3>Contact</h3><Field label="Name" value={lead.fullName} /><Field label="Email" value={lead.email} /><Field label="Phone" value={lead.phone} /><code>{lead.id}</code></article>
      <article className="admin-card"><h3>Property</h3><Field label="Property name" value={lead.propertyName || lead.company} /><Field label="Location" value={lead.propertyLocation} /><Field label="Current website / OTA" value={lead.currentWebsite} /></article>
      <article className="admin-card"><h3>Bishop first read</h3><p>{lead.firstRead || "No AI brief saved yet."}</p><Field label="Next action" value={lead.nextAction} /><Field label="Follow-up" value={lead.nextFollowUpAt?.toISOString().slice(0,10)} /><Field label="Assignment" value={assignmentLabel(lead, admin)} /></article>
    </section>

    <section className="admin-section admin-card"><h3>Durable intake jobs</h3>{lead.processingJobs.length ? <ul className="admin-list">{lead.processingJobs.map((job) => <li key={job.id}><strong>{job.kind}</strong> <span className="admin-chip">{job.status}</span><br /><span className="admin-muted">Attempts: {job.attempts} · Created {job.createdAt.toISOString().slice(0,16).replace("T", " ")} UTC{job.processedAt ? ` · Processed ${job.processedAt.toISOString().slice(0,16).replace("T", " ")} UTC` : ""}</span>{job.lastError ? <p style={{whiteSpace: "pre-wrap"}}>Last error: {job.lastError}</p> : null}<code>{job.id}</code></li>)}</ul> : <p className="admin-muted">No durable processing jobs recorded for this lead yet.</p>}</section>

    <section className="admin-section admin-card"><h3>Operating controls</h3><form action="/admin/platform-leads/ops" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} />
      <label className="admin-muted" htmlFor="status">Status</label><select id="status" name="status" defaultValue={lead.status}>{PLATFORM_LEAD_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
      <label className="admin-muted" htmlFor="firstRead">First read</label><textarea id="firstRead" name="firstRead" rows={3} defaultValue={lead.firstRead || ""} />
      <label className="admin-muted" htmlFor="nextAction">Next action</label><textarea id="nextAction" name="nextAction" rows={3} defaultValue={lead.nextAction || ""} />
      <label className="admin-muted" htmlFor="nextFollowUpAt">Next follow-up date</label><input id="nextFollowUpAt" type="date" name="nextFollowUpAt" defaultValue={lead.nextFollowUpAt?.toISOString().slice(0,10) || ""} />
      <label className="admin-muted" htmlFor="assignment">Assignment</label><select id="assignment" name="assignment" defaultValue={lead.assignedToUserId === admin.id ? "me" : ""}><option value="">Unassigned</option><option value="me">Assign to me ({admin.email})</option></select>
      <label className="admin-muted" htmlFor="source">Source</label><input id="source" name="source" defaultValue={lead.source} />
      <label className="admin-muted" htmlFor="spamReason">Spam/suspicious reason</label><textarea id="spamReason" name="spamReason" rows={2} defaultValue={lead.spamReason || ""} />
      <div className="admin-detail-grid"><label>Setup cents<input name="pricingSetupFeeCents" inputMode="numeric" defaultValue={money(lead.pricingSetupFeeCents)} /></label><label>Monthly cents<input name="pricingMonthlyFeeCents" inputMode="numeric" defaultValue={money(lead.pricingMonthlyFeeCents)} /></label><label>Commission bps<input name="pricingCommissionBps" inputMode="numeric" defaultValue={money(lead.pricingCommissionBps)} /></label><label>Processing bps<input name="pricingPaymentProcessingBps" inputMode="numeric" defaultValue={money(lead.pricingPaymentProcessingBps)} /></label></div>
      <label className="admin-muted" htmlFor="pricingNotes">Pricing notes</label><textarea id="pricingNotes" name="pricingNotes" rows={2} defaultValue={lead.pricingNotes || ""} />
      <label className="admin-muted" htmlFor="contractStatus">Contract status</label><select id="contractStatus" name="contractStatus" defaultValue={lead.contractStatus}>{CONTRACT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
      <label className="admin-muted" htmlFor="contractStorageUrl">Contract storage URL</label><input id="contractStorageUrl" name="contractStorageUrl" defaultValue={lead.contractStorageUrl || ""} />
      <button type="submit">Save operating state</button></form></section>

    <section className="admin-section admin-card"><h3>Lead brief / drafts / proposal artifacts</h3><form action="/admin/platform-leads/artifacts" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><label>Type<select name="type">{ARTIFACT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label><label>Status<select name="status" defaultValue="NEEDS_APPROVAL">{ARTIFACT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><input name="title" required placeholder="Artifact title" /><textarea name="body" rows={6} required placeholder="Lead Brief, draft email, proposal rationale, proposal draft…" /><button type="submit">Save artifact</button></form>
      <ul className="admin-list">{lead.artifacts.map((artifact) => <li key={artifact.id}><strong>{artifact.title}</strong> <span className="admin-chip">{artifact.type.replaceAll("_", " ")}</span> <span className="admin-chip">{artifact.status.replaceAll("_", " ")}</span><p style={{whiteSpace: "pre-wrap"}}>{artifact.body}</p><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><select name="status" defaultValue={artifact.status}>{ARTIFACT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit">Update</button></form></li>)}</ul></section>

    <section className="admin-section admin-card"><h3>Preview Builds</h3><form action="/admin/platform-leads/previews" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><input name="propertyName" defaultValue={lead.propertyName || lead.company || ""} required placeholder="Property name" /><input name="location" defaultValue={lead.propertyLocation || ""} required placeholder="Location" /><textarea name="sourceUrls" rows={3} defaultValue={lead.currentWebsite || ""} required placeholder="One source URL per line" /><input name="heroTitle" placeholder="Optional hero title" /><textarea name="positioning" rows={2} placeholder="Optional positioning line" /><button type="submit">Create Preview Build record</button></form>
      <ul className="admin-list">{lead.previewBuilds.map((preview) => <li key={preview.id}><strong>{preview.propertyName}</strong> <span className="admin-chip">{preview.status.replaceAll("_", " ")}</span><br/><Link href={`/p/${preview.slug}`}>/p/{preview.slug}</Link><form action="/admin/platform-leads/previews" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="previewBuildId" value={preview.id} /><select name="status" defaultValue={preview.status}>{PREVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit">Update</button></form></li>)}</ul></section>

    <section className="admin-section admin-card"><h3>Internal notes</h3><form action="/admin/platform-leads/notes" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><label className="admin-muted" htmlFor="note-body">Add a private note</label><textarea id="note-body" name="body" rows={4} maxLength={4000} required placeholder="Call summary, qualification detail, next-step context…" /><button type="submit">Add note</button></form></section>
    <section className="admin-section admin-card"><h3>Lead timeline</h3><ul className="admin-list"><li><strong>Lead created</strong><br /><span className="admin-muted">{lead.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</span></li>{lead.processingJobs.map((job) => <li key={`job-${job.id}`}><strong>Durable intake job</strong><br/><span className="admin-muted">{job.status} · attempts {job.attempts} · {job.createdAt.toISOString().slice(0,16).replace("T", " ")} UTC</span></li>)}{lead.artifacts.map((artifact) => <li key={`artifact-${artifact.id}`}><strong>{artifact.type.replaceAll("_", " ")}</strong><br/><span className="admin-muted">{artifact.status} · {artifact.createdAt.toISOString().slice(0,16).replace("T", " ")} UTC</span></li>)}{lead.previewBuilds.map((preview) => <li key={`preview-${preview.id}`}><strong>Preview Build</strong><br/><span className="admin-muted">{preview.status} · {preview.slug}</span></li>)}{lead.notes.map((note) => <li key={note.id}><strong>Internal note</strong><br /><span className="admin-muted">{note.authorEmail || "Admin"} · {note.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</span><p>{note.body}</p></li>)}</ul></section>
  </div>;
}
