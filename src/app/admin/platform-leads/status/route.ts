import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { PlatformLeadStatus } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { getAdminPlatformLead, updatePlatformLeadStatus } from "@/lib/platformLeads";

const PLATFORM_LEAD_STATUSES: PlatformLeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "CONVERTED",
  "UNQUALIFIED",
  "ARCHIVED",
];

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  const formData = await req.formData();
  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "") as PlatformLeadStatus;

  if (!leadId || !PLATFORM_LEAD_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid PlatformLead status update" }, { status: 400 });
  }

  const before = await getAdminPlatformLead(leadId);
  if (!before) {
    return NextResponse.json({ error: "PlatformLead not found" }, { status: 404 });
  }

  const updated = await updatePlatformLeadStatus(leadId, status);
  await recordAdminAuditEvent({
    actor: admin,
    action: "admin.platform_lead.status_updated",
    entityType: "PlatformLead",
    entityId: updated.id,
    metadata: { from: before.status, to: updated.status },
  });

  revalidatePath("/admin/platform-leads");
  revalidatePath("/admin/platform-leads/detail");
  revalidatePath("/admin/activity");

  return NextResponse.redirect(new URL(`/admin/platform-leads/detail?leadId=${encodeURIComponent(leadId)}`, req.url), { status: 303 });
}
