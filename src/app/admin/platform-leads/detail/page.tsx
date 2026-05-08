import Link from "next/link";
import { notFound } from "next/navigation";
import type { ContractExecutionStatus, PlatformLeadArtifactStatus, PlatformLeadArtifactType, PlatformLeadStatus, PreviewBuildStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLead } from "@/lib/platformLeads";

const PLATFORM_LEAD_STATUSES: PlatformLeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "UNQUALIFIED", "SUSPICIOUS", "SPAM", "ARCHIVED"];
const ARTIFACT_TYPES: PlatformLeadArtifactType[] = ["LEAD_BRIEF", "FIRST_RESPONSE_DRAFT", "PROPOSAL_RATIONALE", "PROPOSAL_DRAFT", "ONBOARDING_BRIEF", "ONBOARDING_EMAIL_DRAFT", "OWNER_PLATFORM_AGREEMENT", "PREVIEW_PHOTO_GEO_AUDIT", "PREVIEW_DESIGN_BRIEF", "PREVIEW_FACT_REGISTER", "PREVIEW_ASSUMPTION_REGISTER", "PREVIEW_RUBRIC_REVIEW", "PREVIEW_SHARE_NOTE", "PREVIEW_CONVERSION_PACKET"];
const ARTIFACT_STATUSES: PlatformLeadArtifactStatus[] = ["DRAFT", "NEEDS_APPROVAL", "APPROVED", "SENT", "REJECTED", "SUPERSEDED"];
const PREVIEW_STATUSES: PreviewBuildStatus[] = ["DRAFT", "READY_FOR_REVIEW", "SHARED_WITH_LEAD", "PROMOTED_TO_SITE", "ARCHIVED"];
const CONTRACT_STATUSES: ContractExecutionStatus[] = ["NOT_STARTED", "DRAFTED", "SENT", "SIGNED", "COUNTERSIGNED", "VOIDED"];

function Field({ label, value }: { label: string; value?: string | number | null }) { return <p><span className="admin-muted">{label}:</span> {value || "—"}</p>; }
function money(cents?: number | null) { return cents == null ? "" : String(cents); }
function formatDateTime(value: Date) { return value.toISOString().slice(0, 16).replace("T", " "); }
function assignmentLabel(lead: { assignedToUserId?: string | null }, admin: { id: string; email: string }) {
  if (!lead.assignedToUserId) return "Unassigned";
  return lead.assignedToUserId === admin.id ? `Assigned to me (${admin.email})` : `Assigned user ${lead.assignedToUserId}`;
}
function artifactTone(status: PlatformLeadArtifactStatus) {
  if (status === "NEEDS_APPROVAL") return "admin-chip admin-chip-warn";
  if (["REJECTED", "SUPERSEDED"].includes(status)) return "admin-chip admin-chip-danger";
  return "admin-chip";
}
function reviewGuidance(artifact: { status: PlatformLeadArtifactStatus; type: PlatformLeadArtifactType }) {
  if (artifact.type === "OWNER_PLATFORM_AGREEMENT" && artifact.status !== "APPROVED" && artifact.status !== "SENT") return "Internal/legal-review draft. It must be approved before it can be marked sent manually.";
  if (artifact.status === "NEEDS_APPROVAL") return "Awaiting Jaimal review before any owner-facing action.";
  if (artifact.status === "APPROVED") return "Approved for use; still send manually outside DirectStay when ready.";
  if (artifact.status === "SENT") return "Marked sent after manual outreach; DirectStay did not send this automatically.";
  if (artifact.status === "REJECTED") return "Rejected; keep for audit trail and generate or write a replacement if needed.";
  if (artifact.status === "SUPERSEDED") return "Superseded by a newer artifact; retained for history.";
  return "Draft artifact; not ready for external use.";
}

const PREVIEW_PACKET_READY_TYPES: PlatformLeadArtifactType[] = ["PREVIEW_PHOTO_GEO_AUDIT", "PREVIEW_DESIGN_BRIEF", "PREVIEW_FACT_REGISTER", "PREVIEW_ASSUMPTION_REGISTER"];
function activePreviewArtifact(artifact: { status: PlatformLeadArtifactStatus }) { return artifact.status !== "REJECTED" && artifact.status !== "SUPERSEDED"; }
function approvedPreviewArtifact(artifact: { status: PlatformLeadArtifactStatus }) { return artifact.status === "APPROVED" || artifact.status === "SENT"; }
function previewPacketReport(lead: NonNullable<Awaited<ReturnType<typeof getAdminPlatformLead>>>, preview: NonNullable<Awaited<ReturnType<typeof getAdminPlatformLead>>>["previewBuilds"][number]) {
  const activeTypes = new Set(lead.artifacts.filter(activePreviewArtifact).map((artifact) => artifact.type));
  const approvedTypes = new Set(lead.artifacts.filter(approvedPreviewArtifact).map((artifact) => artifact.type));
  const missingReady = PREVIEW_PACKET_READY_TYPES.filter((type) => !activeTypes.has(type));
  const hasSections = Array.isArray(preview.sections) ? preview.sections.length > 0 : Boolean(preview.sections);
  const ownerCallouts = Array.isArray(preview.ownerCallouts) ? preview.ownerCallouts : [];
  const hasSpecificCallouts = ownerCallouts.some((callout) => typeof callout === "object" && callout !== null && "body" in callout && String(callout.body || "").length > 80 && !String(callout.body || "").includes("During onboarding, DirectStay gathers your property"));
  const readyBlockers = [...missingReady.map((type) => `Missing ${type.replaceAll("_", " ").toLowerCase()}`), ...(!hasSections ? ["Missing section plan / rendered sections"] : []), ...(!hasSpecificCallouts ? ["Owner callouts are generic"] : [])];
  const shareBlockers = [...readyBlockers, ...(!approvedTypes.has("PREVIEW_RUBRIC_REVIEW") ? ["Rubric review not approved"] : []), ...(!approvedTypes.has("PREVIEW_SHARE_NOTE") ? ["Owner-share note not approved"] : [])];
  const promoteBlockers = [...shareBlockers, ...(!approvedTypes.has("PREVIEW_CONVERSION_PACKET") ? ["Conversion packet not approved"] : [])];
  return { readyBlockers, shareBlockers, promoteBlockers };
}
const LAUNCH_CHECKS = [
  ["launch_ownerAcceptedProposal", "Owner accepted proposal"],
  ["launch_contractExecuted", "Contract executed"],
  ["launch_onboardingBriefApproved", "Onboarding brief approved"],
  ["launch_ownerContentReceived", "Owner content/photos received"],
  ["launch_previewAssumptionsResolved", "Preview assumptions resolved"],
  ["launch_inquiryFlowApproved", "Inquiry flow approved"],
  ["launch_paymentFlowApproved", "Payment flow approved"],
  ["launch_finalLaunchApprovedByJaimal", "Final launch approved by Jaimal"],
] as const;
function checklistValue(raw: unknown, key: string) {
  return typeof raw === "object" && raw !== null && key in raw && Boolean((raw as Record<string, unknown>)[key]);
}
function checklistNotes(raw: unknown) {
  return typeof raw === "object" && raw !== null && typeof (raw as Record<string, unknown>).notes === "string" ? String((raw as Record<string, unknown>).notes) : "";
}
function launchReady(raw: unknown) {
  return LAUNCH_CHECKS.every(([key]) => checklistValue(raw, key.replace("launch_", "")));
}
function contractExecutedGateOpen(contractStatus: ContractExecutionStatus) {
  return contractStatus === "COUNTERSIGNED";
}

type TimelineEvent = {
  id: string;
  at: Date;
  title: string;
  meta: string;
  body?: string | null;
  href?: string;
};

function buildTimeline(lead: NonNullable<Awaited<ReturnType<typeof getAdminPlatformLead>>>, admin: { id: string; email: string }): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { id: `lead-${lead.id}`, at: lead.createdAt, title: "Lead created", meta: `${lead.source || "direct"} · ${lead.propertyName || lead.company || "Property unnamed"}`, body: lead.message || null },
  ];

  if (lead.firstRead) events.push({ id: `first-read-${lead.id}`, at: lead.updatedAt, title: "Bishop first read saved", meta: lead.nextAction ? `Next: ${lead.nextAction}` : "No next action saved", body: lead.firstRead });
  if (lead.assignedToUserId) events.push({ id: `assignment-${lead.id}`, at: lead.updatedAt, title: "Assignment set", meta: assignmentLabel(lead, admin) });
  if (lead.nextFollowUpAt) events.push({ id: `followup-${lead.id}`, at: lead.nextFollowUpAt, title: "Follow-up scheduled", meta: lead.nextAction || "No next action saved" });
  if (lead.spamReviewedAt) events.push({ id: `spam-${lead.id}`, at: lead.spamReviewedAt, title: "Spam/suspicious review", meta: lead.status, body: lead.spamReason });
  if (lead.contractSentAt) events.push({ id: `contract-sent-${lead.id}`, at: lead.contractSentAt, title: "Contract sent", meta: lead.contractStatus, href: lead.contractStorageUrl || undefined });
  if (lead.contractSignedAt) events.push({ id: `contract-signed-${lead.id}`, at: lead.contractSignedAt, title: "Contract signed", meta: lead.contractStatus, href: lead.contractStorageUrl || undefined });

  for (const job of lead.processingJobs) events.push({ id: `job-${job.id}`, at: job.processedAt || job.updatedAt, title: "Durable intake job", meta: `${job.kind} · ${job.status} · attempts ${job.attempts}`, body: job.lastError });
  for (const artifact of lead.artifacts) {
    events.push({ id: `artifact-${artifact.id}`, at: artifact.createdAt, title: artifact.type.replaceAll("_", " "), meta: `${artifact.status.replaceAll("_", " ")} · ${artifact.title}`, body: artifact.body });
    if (artifact.approvedAt) events.push({ id: `artifact-approved-${artifact.id}`, at: artifact.approvedAt, title: "Artifact approved", meta: `${artifact.title}${artifact.approvedByEmail ? ` · ${artifact.approvedByEmail}` : ""}` });
    if (artifact.sentAt) events.push({ id: `artifact-sent-${artifact.id}`, at: artifact.sentAt, title: "Artifact marked sent", meta: artifact.title });
  }
  for (const preview of lead.previewBuilds) events.push({ id: `preview-${preview.id}`, at: preview.updatedAt, title: "Preview Build", meta: `${preview.status.replaceAll("_", " ")} · /p/${preview.slug}`, href: `/p/${preview.slug}` });
  for (const note of lead.notes) events.push({ id: `note-${note.id}`, at: note.createdAt, title: "Internal note", meta: note.authorEmail || "Admin", body: note.body });

  return events.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export default async function AdminPlatformLeadDetailPage({ searchParams }: { searchParams: Promise<{ leadId?: string; previewGate?: string }> }) {
  const { leadId, previewGate } = await searchParams;
  if (!leadId) notFound();
  const admin = await getAdminSession();
  if (!admin) notFound();
  const lead = await getAdminPlatformLead(leadId);
  if (!lead) notFound();
  await recordAdminAuditEvent({ actor: admin, action: "admin.read.platform_lead", entityType: "PlatformLead", entityId: lead.id });
  const timeline = buildTimeline(lead, admin);

  return <div>
    {previewGate ? <div className="admin-card" style={{ borderColor: "#f59e0b", marginBottom: 16 }}><strong>Preview status blocked</strong><p className="admin-muted">{previewGate}</p></div> : null}
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
      <div className="admin-card"><h4>Launch readiness gate</h4><p className="admin-muted">Keep this conservative. A Preview Build is not launch-ready until every operational, contract, content, inquiry, payment, and final Jaimal approval box is checked.</p><p className="admin-muted">Contract executed can only be saved after contract status is COUNTERSIGNED; SIGNED means owner signature only and is still launch-blocked. Final Jaimal approval can only be saved after every prior gate is complete.</p><span className={launchReady(lead.launchChecklist) ? "admin-chip" : "admin-chip admin-chip-warn"}>{launchReady(lead.launchChecklist) ? "Launch gate complete" : "Launch blocked"}</span><div className="admin-detail-grid" style={{ marginTop: 12 }}>{LAUNCH_CHECKS.map(([key, label]) => {
        const checkKey = key.replace("launch_", "");
        const isContractExecuted = key === "launch_contractExecuted";
        const contractGateClosed = isContractExecuted && !contractExecutedGateOpen(lead.contractStatus);
        return <label key={key}><input type="checkbox" name={key} defaultChecked={checklistValue(lead.launchChecklist, checkKey) && !contractGateClosed} /> {label}{contractGateClosed ? <span className="admin-muted"> — save only allowed with COUNTERSIGNED</span> : null}</label>;
      })}</div><label className="admin-muted" htmlFor="launch_notes">Launch/onboarding notes</label><textarea id="launch_notes" name="launch_notes" rows={3} defaultValue={checklistNotes(lead.launchChecklist)} placeholder="Outstanding onboarding facts, content gaps, contract notes, launch blockers…" /></div>
      <button type="submit">Save operating state</button></form></section>

    <section className="admin-section admin-card"><h3>Lead brief / drafts / proposal artifacts</h3><p className="admin-muted">Generate proposal rationale and proposal draft artifacts for approval. This never sends an external email; SENT is only a manual marker after Jaimal approval and actual outreach.</p><div className="admin-actions" style={{ flexWrap: "wrap" }}><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="generate-proposal" /><input type="hidden" name="leadId" value={lead.id} /><button type="submit">Generate proposal rationale + draft</button></form><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="generate-onboarding" /><input type="hidden" name="leadId" value={lead.id} /><button type="submit" className="admin-button-secondary">Generate onboarding brief + email draft</button></form><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="generate-owner-agreement" /><input type="hidden" name="leadId" value={lead.id} /><button type="submit" className="admin-button-secondary">Create owner agreement draft</button></form></div><p className="admin-muted">Owner agreement drafts are internal/legal-review artifacts only. Do not send or enable signature flow until Jaimal/counsel approves the final terms.</p><form action="/admin/platform-leads/artifacts" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><label>Type<select name="type">{ARTIFACT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label><label>Status<select name="status" defaultValue="NEEDS_APPROVAL">{ARTIFACT_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><input name="title" required placeholder="Artifact title" /><textarea name="body" rows={6} required placeholder="Lead Brief, draft email, proposal rationale, proposal draft…" /><button type="submit">Save artifact</button></form>
      <ul className="admin-list">{lead.artifacts.map((artifact) => <li key={artifact.id}><strong>{artifact.title}</strong> <span className="admin-chip">{artifact.type.replaceAll("_", " ")}</span> <span className={artifactTone(artifact.status)}>{artifact.status.replaceAll("_", " ")}</span><p className="admin-muted">{reviewGuidance(artifact)}</p><p style={{whiteSpace: "pre-wrap"}}>{artifact.body}</p><div className="admin-actions" style={{ flexWrap: "wrap" }}><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><input type="hidden" name="status" value="APPROVED" /><button type="submit">Approve</button></form><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><input type="hidden" name="status" value="REJECTED" /><button type="submit" className="admin-button-secondary">Reject</button></form><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><input type="hidden" name="status" value="SUPERSEDED" /><button type="submit" className="admin-button-secondary">Supersede</button></form><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><input type="hidden" name="status" value="SENT" /><button type="submit" className="admin-button-secondary">Mark sent manually</button></form></div><details><summary className="admin-muted">Advanced status override</summary><form action="/admin/platform-leads/artifacts" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="artifactId" value={artifact.id} /><select name="status" defaultValue={artifact.status}>{ARTIFACT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit">Update</button></form></details></li>)}</ul></section>

    <section className="admin-section admin-card"><h3>Preview Builds</h3><p className="admin-muted">Preview URLs are public-obscure, not confidential. Do not share with an owner until the packet, safety/rubric pass, and owner-share note are approved.</p><form action="/admin/platform-leads/previews" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><input name="propertyName" defaultValue={lead.propertyName || lead.company || ""} required placeholder="Property name" /><input name="location" defaultValue={lead.propertyLocation || ""} required placeholder="Location" /><textarea name="sourceUrls" rows={3} defaultValue={lead.currentWebsite || ""} required placeholder="One source URL per line" /><input name="heroTitle" placeholder="Optional hero title" /><textarea name="positioning" rows={2} placeholder="Optional positioning line" /><button type="submit">Create Preview Build record</button></form>
      <ul className="admin-list">{lead.previewBuilds.map((preview) => { const gates = previewPacketReport(lead, preview); return <li key={preview.id}><strong>{preview.propertyName}</strong> <span className="admin-chip">{preview.status.replaceAll("_", " ")}</span><br/><Link href={`/p/${preview.slug}`}>/p/{preview.slug}</Link> <Link className="admin-muted" href={`/p/${preview.slug}?view=guest`}>guest view</Link><div className="admin-card" style={{ marginTop: 10 }}><strong>Packet gates</strong><p className={gates.readyBlockers.length ? "admin-chip admin-chip-warn" : "admin-chip"}>{gates.readyBlockers.length ? `Ready blocked: ${gates.readyBlockers.join("; ")}` : "Ready packet complete"}</p><p className={gates.shareBlockers.length ? "admin-chip admin-chip-warn" : "admin-chip"}>{gates.shareBlockers.length ? `Owner-share blocked: ${gates.shareBlockers.join("; ")}` : "Owner-share gate complete"}</p><p className={gates.promoteBlockers.length ? "admin-chip admin-chip-warn" : "admin-chip"}>{gates.promoteBlockers.length ? `Production promotion blocked: ${gates.promoteBlockers.join("; ")}` : "Promotion gate complete"}</p></div><form action="/admin/platform-leads/previews" method="post" className="admin-inline-form"><input type="hidden" name="action" value="status" /><input type="hidden" name="leadId" value={lead.id} /><input type="hidden" name="previewBuildId" value={preview.id} /><select name="status" defaultValue={preview.status}>{PREVIEW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit">Update</button></form></li>; })}</ul></section>

    <section className="admin-section admin-card"><h3>Internal notes</h3><form action="/admin/platform-leads/notes" method="post" className="admin-form-stack"><input type="hidden" name="leadId" value={lead.id} /><label className="admin-muted" htmlFor="note-body">Add a private note</label><textarea id="note-body" name="body" rows={4} maxLength={4000} required placeholder="Call summary, qualification detail, next-step context…" /><button type="submit">Add note</button></form></section>
    <section className="admin-section admin-card"><h3>Lead timeline</h3><p className="admin-muted">Reverse-chronological operating history for this PlatformLead: intake jobs, AI artifacts, notes, follow-ups, preview builds, approvals, and contract milestones.</p><ul className="admin-list">{timeline.map((event) => <li key={event.id}><strong>{event.title}</strong> <span className="admin-chip">{formatDateTime(event.at)} UTC</span><br /><span className="admin-muted">{event.href ? <Link href={event.href}>{event.meta}</Link> : event.meta}</span>{event.body ? <p style={{whiteSpace: "pre-wrap"}}>{event.body}</p> : null}</li>)}</ul></section>
  </div>;
}
