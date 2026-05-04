import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/adminAuth";
import { recordAdminAuditEvent } from "@/lib/admin/auditLog";
import { ADMIN_OWNER_CONTEXT_COOKIE, serializeAdminOwnerContext } from "@/lib/admin/ownerContext";
import { getPrismaClient } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: Promise<{ ownerId: string }> }) {
  const admin = await requireAdminSession();
  const { ownerId } = await params;
  const prisma = await getPrismaClient();
  const owner = await prisma.owner.findUnique({ where: { id: ownerId }, select: { id: true, displayName: true } });

  if (!owner) redirect(`/admin/owners/${ownerId}`);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_OWNER_CONTEXT_COOKIE, serializeAdminOwnerContext(owner.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 4,
  });

  await recordAdminAuditEvent({
    actor: admin,
    action: "admin.owner_context.start",
    entityType: "Owner",
    entityId: owner.id,
    ownerId: owner.id,
    metadata: { ownerName: owner.displayName },
  });

  redirect("/owner-portal");
}
