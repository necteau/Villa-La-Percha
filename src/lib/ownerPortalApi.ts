import { NextResponse } from "next/server";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

export async function requireOwnerPortalSession() {
  const user = await getOwnerSessionUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
