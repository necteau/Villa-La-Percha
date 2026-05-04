import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

export async function requireOwnerPortalSession() {
  const user = await getOwnerSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function requireOwnerPortalWriteAccess() {
  const user = await getOwnerSessionUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const prisma = await getPrismaClient();
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email.toLowerCase() },
    select: { role: true },
  });

  if (dbUser?.role === "ADMIN") {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin owner-context mode is read-only. Use the admin portal for approved writes.",
      },
      { status: 403 }
    );
  }

  return null;
}
