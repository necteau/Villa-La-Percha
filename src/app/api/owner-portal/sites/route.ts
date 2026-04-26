import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { getSiteSettings, updateSiteSettings } from "@/lib/ownerPortalSettings";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const site = await getSiteSettings();
  return NextResponse.json({ ok: true, site });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const site = await updateSiteSettings(body);
    return NextResponse.json({ ok: true, site });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update site settings" },
      { status: 400 }
    );
  }
}
