import { redirect } from "next/navigation";
import type { ContractExecutionStatus, PlatformLeadStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { updatePlatformLeadOps } from "@/lib/platformLeads";

const STATUSES = new Set<PlatformLeadStatus>(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "CONVERTED", "UNQUALIFIED", "SUSPICIOUS", "SPAM", "ARCHIVED"]);
const CONTRACTS = new Set<ContractExecutionStatus>(["NOT_STARTED", "DRAFTED", "SENT", "SIGNED", "COUNTERSIGNED", "VOIDED"]);
function optionalInt(value: FormDataEntryValue | null) { const raw = String(value || "").trim(); if (!raw) return null; const n = Number(raw); return Number.isFinite(n) ? Math.round(n) : null; }

export async function POST(request: Request) {
  const admin = await getAdminSession();
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "");
  if (!leadId) redirect("/admin/platform-leads");
  const status = String(form.get("status") || "") as PlatformLeadStatus;
  const contractStatus = String(form.get("contractStatus") || "") as ContractExecutionStatus;
  const followUpRaw = String(form.get("nextFollowUpAt") || "");
  await updatePlatformLeadOps({
    leadId,
    ...(STATUSES.has(status) ? { status } : {}),
    firstRead: String(form.get("firstRead") || ""),
    nextAction: String(form.get("nextAction") || ""),
    nextFollowUpAt: followUpRaw ? new Date(`${followUpRaw}T12:00:00.000Z`) : null,
    source: String(form.get("source") || "direct"),
    spamReason: String(form.get("spamReason") || ""),
    pricingSetupFeeCents: optionalInt(form.get("pricingSetupFeeCents")),
    pricingMonthlyFeeCents: optionalInt(form.get("pricingMonthlyFeeCents")),
    pricingCommissionBps: optionalInt(form.get("pricingCommissionBps")),
    pricingPaymentProcessingBps: optionalInt(form.get("pricingPaymentProcessingBps")),
    pricingNotes: String(form.get("pricingNotes") || ""),
    ...(CONTRACTS.has(contractStatus) ? { contractStatus } : {}),
    contractStorageUrl: String(form.get("contractStorageUrl") || ""),
  });
  await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.ops_updated", entityType: "PlatformLead", entityId: leadId, metadata: { status, contractStatus } });
  redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
}
