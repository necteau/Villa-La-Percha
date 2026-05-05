import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

async function readOnlyResponse() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ ok: false, error: "External reservations are read-only integration records." }, { status: 405 });
}

export async function PATCH() {
  return readOnlyResponse();
}

export async function DELETE() {
  return readOnlyResponse();
}
