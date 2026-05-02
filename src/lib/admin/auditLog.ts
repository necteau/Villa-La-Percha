import { getPrismaClient } from "@/lib/db";
import type { AdminSession } from "./adminAuth";

type AuditMetadata = Record<string, string | number | boolean | null | undefined>;

export type AdminAuditEvent = {
  actor?: AdminSession | null;
  actorEmail?: string | null;
  actorRole?: "ADMIN" | "OWNER" | "MANAGER" | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ownerId?: string | null;
  propertyId?: string | null;
  metadata?: AuditMetadata;
};

export async function recordAdminAuditEvent(event: AdminAuditEvent) {
  try {
    const prisma = await getPrismaClient();
    await prisma.auditLog.create({
      data: {
        actorUserId: event.actor?.id,
        actorEmail: event.actor?.email ?? event.actorEmail ?? null,
        actorRole: event.actor?.role ?? event.actorRole ?? null,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        ownerId: event.ownerId ?? null,
        propertyId: event.propertyId ?? null,
        metadata: event.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.warn("Admin audit event was not recorded", {
      action: event.action,
      entityType: event.entityType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getAdminActivityLog(limit = 100) {
  const prisma = await getPrismaClient();
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
