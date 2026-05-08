import { redirect } from "next/navigation";
import type { PreviewBuildStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { createPreviewBuild, updatePreviewBuildStatus } from "@/lib/platformLeads";
const STATUSES = new Set<PreviewBuildStatus>(["DRAFT", "READY_FOR_REVIEW", "SHARED_WITH_LEAD", "PROMOTED_TO_SITE", "ARCHIVED"]);

export async function POST(request: Request) {
  const admin = await getAdminSession();
  const form = await request.formData();
  const leadId = String(form.get("leadId") || "");
  const action = String(form.get("action") || "create");
  if (!leadId) redirect("/admin/platform-leads");
  if (action === "status") {
    const previewBuildId = String(form.get("previewBuildId") || "");
    const status = String(form.get("status") || "") as PreviewBuildStatus;
    if (previewBuildId && STATUSES.has(status)) {
      try {
        await updatePreviewBuildStatus(previewBuildId, status);
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_status_updated", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, status } });
      } catch (error) {
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_status_blocked", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, status, error: error instanceof Error ? error.message : String(error) } });
        redirect(`/admin/platform-leads/detail?leadId=${leadId}&previewGate=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
      }
    }
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }
  const propertyName = String(form.get("propertyName") || "");
  const location = String(form.get("location") || "");
  const sourceUrls = String(form.get("sourceUrls") || "").split(/\n|,/).map((x) => x.trim()).filter(Boolean);
  if (propertyName.trim() && location.trim() && sourceUrls.length > 0) {
    const preview = await createPreviewBuild({ leadId, propertyName, location, sourceUrls, heroTitle: String(form.get("heroTitle") || ""), positioning: String(form.get("positioning") || "") });
    await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_created", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId: preview.id, slug: preview.slug } });
  }
  redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
}
