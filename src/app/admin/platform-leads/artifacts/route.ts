import { redirect } from "next/navigation";
import type { PlatformLeadArtifactStatus, PlatformLeadArtifactType } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { createPlatformLeadArtifact, createPlatformLeadOnboardingArtifacts, createPlatformLeadProposalArtifacts, updatePlatformLeadArtifactStatus } from "@/lib/platformLeads";

const TYPES = new Set<PlatformLeadArtifactType>(["LEAD_BRIEF", "FIRST_RESPONSE_DRAFT", "PROPOSAL_RATIONALE", "PROPOSAL_DRAFT", "ONBOARDING_BRIEF", "ONBOARDING_EMAIL_DRAFT"]);
const STATUSES = new Set<PlatformLeadArtifactStatus>(["DRAFT", "NEEDS_APPROVAL", "APPROVED", "SENT", "REJECTED", "SUPERSEDED"]);

export async function POST(request: Request) {
  const admin = await getAdminSession();
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "");
  const action = String(form.get("action") || "create");
  if (!leadId) redirect("/admin/platform-leads");

  if (action === "status") {
    const artifactId = String(form.get("artifactId") || "");
    const status = String(form.get("status") || "") as PlatformLeadArtifactStatus;
    if (artifactId && STATUSES.has(status)) {
      await updatePlatformLeadArtifactStatus({ artifactId, status, approvedByEmail: admin?.email });
      await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.artifact_status_updated", entityType: "PlatformLead", entityId: leadId, metadata: { artifactId, status } });
    }
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  if (action === "generate-proposal") {
    const result = await createPlatformLeadProposalArtifacts({ leadId, createdByEmail: admin?.email });
    await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.proposal_generation_requested", entityType: "PlatformLead", entityId: leadId, metadata: { created: result.created, artifactCount: result.artifacts.length, existingProposalId: result.existingProposalId ?? null } });
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  if (action === "generate-onboarding") {
    const result = await createPlatformLeadOnboardingArtifacts({ leadId, createdByEmail: admin?.email });
    await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.onboarding_generation_requested", entityType: "PlatformLead", entityId: leadId, metadata: { created: result.created, artifactCount: result.artifacts.length, existingOnboardingId: result.existingOnboardingId ?? null } });
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  const type = String(form.get("type") || "") as PlatformLeadArtifactType;
  const status = String(form.get("status") || "DRAFT") as PlatformLeadArtifactStatus;
  const title = String(form.get("title") || "");
  const body = String(form.get("body") || "");
  if (TYPES.has(type) && STATUSES.has(status) && title.trim() && body.trim()) {
    const artifact = await createPlatformLeadArtifact({ leadId, type, status, title, body, createdByEmail: admin?.email });
    await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.artifact_created", entityType: "PlatformLead", entityId: leadId, metadata: { artifactId: artifact.id, type, status } });
  }
  redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
}
