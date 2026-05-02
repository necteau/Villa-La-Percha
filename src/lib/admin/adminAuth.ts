import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/db";
import { getOwnerSessionUser } from "@/lib/ownerAuth";
import { recordAdminAuditEvent } from "./auditLog";

export type AdminSession = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN";
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const sessionUser = await getOwnerSessionUser();
  const email = sessionUser?.email?.trim().toLowerCase();
  if (!email) return null;

  const prisma = await getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, fullName: true, role: true },
  });

  if (user?.role !== "ADMIN") {
    if (user) {
      await recordAdminAuditEvent({
        actorEmail: user.email,
        actorRole: user.role,
        action: "admin.access_denied",
        entityType: "AdminPortal",
        entityId: "/admin",
        metadata: { reason: "non_admin_role" },
      });
    }
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: "ADMIN",
  };
}

export async function requireAdminSession(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) redirect("/owner-portal/login?next=/admin");
  return admin;
}
