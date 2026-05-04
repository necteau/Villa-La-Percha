import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { ADMIN_OWNER_CONTEXT_COOKIE, parseAdminOwnerContextCookie } from "@/lib/admin/ownerContext";

export async function POST() {
  const admin = await getAdminSession();
  const cookieStore = await cookies();
  const ownerId = parseAdminOwnerContextCookie(cookieStore.get(ADMIN_OWNER_CONTEXT_COOKIE)?.value);
  cookieStore.delete(ADMIN_OWNER_CONTEXT_COOKIE);

  if (ownerId) {
    await recordAdminAuditEvent({
      actor: admin,
      action: "admin.owner_context.end",
      entityType: "Owner",
      entityId: ownerId,
      ownerId,
    });
  }

  redirect(ownerId ? `/admin/owners/${ownerId}` : "/admin/owners");
}
