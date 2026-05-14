import { getPrismaClient } from "@/lib/db";
import { getOwnerSessionUser } from "@/lib/ownerAuth";
import { getSelectedAdminOwnerContext } from "@/lib/admin/ownerContext";

const FALLBACK_PROPERTY_SLUG = "villa-la-percha";

export interface OwnerPortalScope {
  isAdmin: boolean;
  ownerIds: string[] | null;
}

export interface OwnerPortalPropertyScope {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
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
      const adminContext = await getSelectedAdminOwnerContext().catch(() => null);
      return { isAdmin: false, ownerIds: adminContext ? [adminContext.ownerId] : [] };
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

export async function getOwnerPortalPropertyScope(propertySlug = FALLBACK_PROPERTY_SLUG): Promise<OwnerPortalPropertyScope> {
  const prisma = await getPrismaClient();
  const scope = await getOwnerPortalScope();
  const property = await prisma.property.findUnique({
    where: { slug: propertySlug },
    select: { id: true, ownerId: true, slug: true, name: true },
  });
  if (!property) throw new Error("Property is not configured.");
  if (scope.ownerIds && !scope.ownerIds.includes(property.ownerId)) {
    throw new Error("You do not have access to this property.");
  }
  return property;
}

export async function assertOwnerPortalPropertyAccess(propertyId: string): Promise<OwnerPortalPropertyScope> {
  const prisma = await getPrismaClient();
  const scope = await getOwnerPortalScope();
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true, slug: true, name: true },
  });
  if (!property) throw new Error("Property is not configured.");
  if (scope.ownerIds && !scope.ownerIds.includes(property.ownerId)) {
    throw new Error("You do not have access to this property.");
  }
  return property;
}
