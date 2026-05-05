import { redirect } from "next/navigation";
import type { ContractExecutionStatus, PlatformLeadStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { updatePlatformLeadOps } from "@/lib/platformLeads";

const STATUSES = new Set<PlatformLeadStatus>(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "UNQUALIFIED", "SUSPICIOUS", "SPAM", "ARCHIVED"]);
const CONTRACTS = new Set<ContractExecutionStatus>(["NOT_STARTED", "DRAFTED", "SENT", "SIGNED", "COUNTERSIGNED", "VOIDED"]);
function optionalInt(value: FormDataEntryValue | null) { const raw = String(value || "").trim(); if (!raw) return null; const n = Number(raw); return Number.isFinite(n) ? Math.round(n) : null; }
function checked(form: FormData, key: string) { return form.get(key) === "on"; }

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "");
  if (!leadId) redirect("/admin/platform-leads");
  const status = String(form.get("status") || "") as PlatformLeadStatus;
  const contractStatus = String(form.get("contractStatus") || "") as ContractExecutionStatus;
  const followUpRaw = String(form.get("nextFollowUpAt") || "");
  const assignment = String(form.get("assignment") || "");
  const validContractStatus = CONTRACTS.has(contractStatus) ? contractStatus : undefined;
  const contractExecutedRequested = checked(form, "launch_contractExecuted");
  const contractExecuted = validContractStatus === "COUNTERSIGNED" && contractExecutedRequested;
  const rawLaunchNotes = String(form.get("launch_notes") || "").trim();
  const contractGateNote = contractExecutedRequested && validContractStatus !== "COUNTERSIGNED"
    ? "Contract executed was not saved because contract status must be COUNTERSIGNED first."
    : "";
  const launchNotes = [rawLaunchNotes, contractGateNote].filter(Boolean).join("\n").slice(0, 2000) || null;

  await updatePlatformLeadOps({
    leadId,
    ...(STATUSES.has(status) ? { status } : {}),
    firstRead: String(form.get("firstRead") || ""),
    nextAction: String(form.get("nextAction") || ""),
    nextFollowUpAt: followUpRaw ? new Date(`${followUpRaw}T12:00:00.000Z`) : null,
    assignedToUserId: assignment === "me" ? admin.id : null,
    source: String(form.get("source") || "direct"),
    spamReason: String(form.get("spamReason") || ""),
    pricingSetupFeeCents: optionalInt(form.get("pricingSetupFeeCents")),
    pricingMonthlyFeeCents: optionalInt(form.get("pricingMonthlyFeeCents")),
    pricingCommissionBps: optionalInt(form.get("pricingCommissionBps")),
    pricingPaymentProcessingBps: optionalInt(form.get("pricingPaymentProcessingBps")),
    pricingNotes: String(form.get("pricingNotes") || ""),
    ...(validContractStatus ? { contractStatus: validContractStatus } : {}),
    contractStorageUrl: String(form.get("contractStorageUrl") || ""),
    launchChecklist: {
      ownerAcceptedProposal: checked(form, "launch_ownerAcceptedProposal"),
      contractExecuted,
      onboardingBriefApproved: checked(form, "launch_onboardingBriefApproved"),
      ownerContentReceived: checked(form, "launch_ownerContentReceived"),
      previewAssumptionsResolved: checked(form, "launch_previewAssumptionsResolved"),
      inquiryFlowApproved: checked(form, "launch_inquiryFlowApproved"),
      paymentFlowApproved: checked(form, "launch_paymentFlowApproved"),
      finalLaunchApprovedByJaimal: checked(form, "launch_finalLaunchApprovedByJaimal"),
      notes: launchNotes,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email,
    },
  });
  await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.ops_updated", entityType: "PlatformLead", entityId: leadId, metadata: { status, contractStatus, assignment, launchChecklistUpdated: true } });
  redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
}
