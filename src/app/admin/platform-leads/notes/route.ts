import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { addPlatformLeadNote, getAdminPlatformLead } from "@/lib/platformLeads";

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  const formData = await req.formData();
  const leadId = String(formData.get("leadId") || "");
  const body = String(formData.get("body") || "").trim();

  if (!leadId || !body) {
    return NextResponse.json({ error: "Please include a note." }, { status: 400 });
  }

  if (body.length > 4000) {
    return NextResponse.json({ error: "Note is too long." }, { status: 400 });
  }

  const lead = await getAdminPlatformLead(leadId);
  if (!lead) {
    return NextResponse.json({ error: "PlatformLead not found" }, { status: 404 });
  }

  const note = await addPlatformLeadNote({
    leadId,
    body,
    authorUserId: admin.id,
    authorEmail: admin.email,
  });

  await recordAdminAuditEvent({
    actor: admin,
    action: "admin.platform_lead.note_added",
    entityType: "PlatformLead",
    entityId: leadId,
    metadata: { noteId: note.id, noteLength: body.length },
  });

  revalidatePath("/admin/platform-leads/detail");
  revalidatePath("/admin/activity");

  return NextResponse.redirect(new URL(`/admin/platform-leads/detail?leadId=${encodeURIComponent(leadId)}`, req.url), { status: 303 });
}
