import { redirect } from "next/navigation";
import type { PreviewBuildStatus } from "@prisma/client";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { appendPreviewBuildSection, createPreviewBuild, deletePreviewBuildSection, generatePreviewBuildStarterPacket, movePreviewBuildSection, updatePreviewBuildContent, updatePreviewBuildSection, updatePreviewBuildStatus } from "@/lib/platformLeads";
const STATUSES = new Set<PreviewBuildStatus>(["DRAFT", "READY_FOR_REVIEW", "SHARED_WITH_LEAD", "PROMOTED_TO_SITE", "ARCHIVED"]);

function parsePreviewJson(value: FormDataEntryValue | null, fallback: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  const parsed = JSON.parse(raw) as unknown;
  if (parsed === null || typeof parsed !== "object") throw new Error("Preview JSON must be an object or array.");
  return parsed;
}

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

  if (action === "generate-packet") {
    const previewBuildId = String(form.get("previewBuildId") || "");
    if (previewBuildId) {
      try {
        const result = await generatePreviewBuildStarterPacket({ previewBuildId, createdByEmail: admin?.email });
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_packet_generated", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, artifactCount: result.artifacts.length, skippedExistingTypes: result.skippedExistingTypes.join(", ") } });
      } catch (error) {
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_packet_generation_failed", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, error: error instanceof Error ? error.message : String(error) } });
        redirect(`/admin/platform-leads/detail?leadId=${leadId}&previewGate=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
      }
    }
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  if (action === "add-section") {
    const previewBuildId = String(form.get("previewBuildId") || "");
    if (previewBuildId) {
      try {
        await appendPreviewBuildSection({
          previewBuildId,
          kind: String(form.get("sectionKind") || "custom"),
          eyebrow: String(form.get("sectionEyebrow") || ""),
          title: String(form.get("sectionTitle") || ""),
          body: String(form.get("sectionBody") || ""),
          imageUrl: String(form.get("sectionImageUrl") || ""),
          imageAlt: String(form.get("sectionImageAlt") || ""),
        });
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_section_added", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, kind: String(form.get("sectionKind") || "custom") } });
      } catch (error) {
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_section_rejected", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, error: error instanceof Error ? error.message : String(error) } });
        redirect(`/admin/platform-leads/detail?leadId=${leadId}&previewGate=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
      }
    }
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  if (action === "section") {
    const previewBuildId = String(form.get("previewBuildId") || "");
    const sectionAction = String(form.get("sectionAction") || "update");
    const index = Number.parseInt(String(form.get("sectionIndex") || "-1"), 10);
    if (previewBuildId) {
      try {
        if (sectionAction === "delete") await deletePreviewBuildSection({ previewBuildId, index });
        else if (sectionAction === "up" || sectionAction === "down") await movePreviewBuildSection({ previewBuildId, index, direction: sectionAction });
        else await updatePreviewBuildSection({
          previewBuildId,
          index,
          kind: String(form.get("sectionKind") || "custom"),
          eyebrow: String(form.get("sectionEyebrow") || ""),
          title: String(form.get("sectionTitle") || ""),
          body: String(form.get("sectionBody") || ""),
          imageUrl: String(form.get("sectionImageUrl") || ""),
          imageAlt: String(form.get("sectionImageAlt") || ""),
        });
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_section_managed", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, sectionAction, index } });
      } catch (error) {
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_section_rejected", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, sectionAction, index, error: error instanceof Error ? error.message : String(error) } });
        redirect(`/admin/platform-leads/detail?leadId=${leadId}&previewGate=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`);
      }
    }
    redirect(`/admin/platform-leads/detail?leadId=${leadId}`);
  }

  if (action === "content") {
    const previewBuildId = String(form.get("previewBuildId") || "");
    if (previewBuildId) {
      try {
        const sections = parsePreviewJson(form.get("sectionsJson"), []);
        if (!Array.isArray(sections)) throw new Error("Sections JSON must be an array.");
        const ownerCallouts = parsePreviewJson(form.get("ownerCalloutsJson"), []);
        if (!Array.isArray(ownerCallouts)) throw new Error("Owner callouts JSON must be an array.");
        await updatePreviewBuildContent({
          previewBuildId,
          heroTitle: String(form.get("heroTitle") || ""),
          positioning: String(form.get("positioning") || ""),
          sections,
          ownerCallouts,
        });
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_content_updated", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, sectionCount: sections.length, ownerCalloutCount: ownerCallouts.length } });
      } catch (error) {
        await recordAdminAuditEvent({ actor: admin, action: "admin.platform_lead.preview_content_rejected", entityType: "PlatformLead", entityId: leadId, metadata: { previewBuildId, error: error instanceof Error ? error.message : String(error) } });
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
