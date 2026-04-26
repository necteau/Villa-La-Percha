import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/ownerPortalSettings";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const settings = await getPaymentSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const settings = await updatePaymentSettings(body);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update payment settings" },
      { status: 400 }
    );
  }
}
