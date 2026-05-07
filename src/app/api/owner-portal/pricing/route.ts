import { NextResponse } from "next/server";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";
import { getPricingTaxSettings, listPricingEntries, updatePricingEntry, updatePricingTaxSettings } from "@/lib/pricingData";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const [entries, taxSettings] = await Promise.all([listPricingEntries(), getPricingTaxSettings()]);
  return NextResponse.json({ ok: true, entries, taxSettings });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  try {
    const body = await req.json();
    if (body?.action === "update-tax-settings") {
      const taxSettings = await updatePricingTaxSettings({
        mode: body?.taxSettings?.mode,
        rate: Number(body?.taxSettings?.rate || 0),
        label: String(body?.taxSettings?.label || "Tax"),
      });
      return NextResponse.json({ ok: true, taxSettings });
    }

    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing pricing entry id" }, { status: 400 });
    }

    const entry = await updatePricingEntry(id, body);
    if (!entry) {
      return NextResponse.json({ ok: false, error: "Pricing entry not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update pricing entry" },
      { status: 400 }
    );
  }
}
