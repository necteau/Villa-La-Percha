import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { updatePricingEntry } from "@/lib/pricingData";

interface Context {
  params: Promise<{ id: string }>;
}

async function handleUpdate(req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const entry = await updatePricingEntry(id, body);
    if (!entry) return NextResponse.json({ ok: false, error: "Pricing entry not found" }, { status: 404 });
    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update pricing entry" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request, context: Context) {
  return handleUpdate(req, context);
}

export async function POST(req: Request, context: Context) {
  return handleUpdate(req, context);
}
