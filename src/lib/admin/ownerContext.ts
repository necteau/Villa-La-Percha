import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getPrismaClient } from "@/lib/db";

export const ADMIN_OWNER_CONTEXT_COOKIE = "directstay_admin_owner_context";

export type AdminOwnerContext = {
  ownerId: string;
  ownerName: string;
};

function getSigningSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_JWT_SECRET ||
    process.env.DATABASE_URL ||
    "directstay-local-admin-owner-context"
  );
}

function signOwnerId(ownerId: string): string {
  return createHmac("sha256", getSigningSecret()).update(ownerId).digest("base64url");
}

function isValidSignature(ownerId: string, signature: string): boolean {
  const expected = Buffer.from(signOwnerId(ownerId));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function serializeAdminOwnerContext(ownerId: string): string {
  return `${ownerId}.${signOwnerId(ownerId)}`;
}

export function parseAdminOwnerContextCookie(value?: string | null): string | null {
  if (!value) return null;
  const [ownerId, signature] = value.split(".");
  if (!ownerId || !signature) return null;
  return isValidSignature(ownerId, signature) ? ownerId : null;
}

export async function getSelectedAdminOwnerContext(): Promise<AdminOwnerContext | null> {
  const cookieStore = await cookies();
  const ownerId = parseAdminOwnerContextCookie(cookieStore.get(ADMIN_OWNER_CONTEXT_COOKIE)?.value);
  if (!ownerId) return null;

  const prisma = await getPrismaClient();
  const owner = await prisma.owner.findUnique({ where: { id: ownerId }, select: { id: true, displayName: true } });
  if (!owner) return null;

  return { ownerId: owner.id, ownerName: owner.displayName };
}
