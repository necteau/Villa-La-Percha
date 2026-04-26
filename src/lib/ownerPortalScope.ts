import { getPrismaClient } from "@/lib/db";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

const FALLBACK_PROPERTY_SLUG = "villa-la-percha";

export interface OwnerPortalScope {
  isAdmin: boolean;
  ownerIds: string[] | null;
}

async function getFallbackOwnerId(): Promise<string | null> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({
    where: { slug: FALLBACK_PROPERTY_SLUG },
    select: { ownerId: true },
  });
  return property?.ownerId ?? null;
}

export async function getOwnerPortalScope(): Promise<OwnerPortalScope> {
  const sessionUser = await getOwnerSessionUser();
  if (!sessionUser?.email) {
    const fallbackOwnerId = await getFallbackOwnerId().catch(() => null);
    return { isAdmin: false, ownerIds: fallbackOwnerId ? [fallbackOwnerId] : null };
  }

  try {
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email.toLowerCase() },
      include: {
        memberships: { select: { ownerId: true } },
        ownerProfiles: { select: { id: true } },
      },
    });

    if (user?.role === "ADMIN") {
      return { isAdmin: true, ownerIds: null };
    }

    const ownerIds = Array.from(
      new Set([
        ...(user?.memberships.map((membership) => membership.ownerId) || []),
        ...(user?.ownerProfiles.map((owner) => owner.id) || []),
      ])
    );

    if (ownerIds.length > 0) {
      return { isAdmin: false, ownerIds };
    }
  } catch {
    // Fall through to property-based fallback.
  }

  const fallbackOwnerId = await getFallbackOwnerId().catch(() => null);
  return { isAdmin: false, ownerIds: fallbackOwnerId ? [fallbackOwnerId] : null };
}
