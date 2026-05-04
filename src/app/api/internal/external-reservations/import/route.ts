import { NextRequest, NextResponse } from "next/server";
import type { ExternalReservationImport } from "@/lib/externalReservationReconciliation";
import { runExternalReservationSync } from "@/lib/externalReservationReconciliation";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET || process.env.INQUIRY_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const imports = Array.isArray(body.imports) ? body.imports as ExternalReservationImport[] : [];
    if (imports.length === 0) {
      return NextResponse.json({ ok: false, error: "imports must be a non-empty array" }, { status: 400 });
    }

    const result = await runExternalReservationSync(imports);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to import external reservations" },
      { status: 500 },
    );
  }
}
