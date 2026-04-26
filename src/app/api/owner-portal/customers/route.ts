import { NextResponse } from "next/server";
import { getCustomerById, listCustomers, updateCustomer } from "@/lib/customers";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const customers = await listCustomers();
  return NextResponse.json({ ok: true, customers });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "update") {
      const id = String(body?.id || "");
      if (!id) {
        return NextResponse.json({ ok: false, error: "Missing customer id" }, { status: 400 });
      }

      const customer = await updateCustomer({
        id,
        status: body?.status,
        notes: body?.notes,
        phone: body?.phone,
        locationLabel: body?.locationLabel,
        timezone: body?.timezone,
        preferredContactMethod: body?.preferredContactMethod,
        preferencesSummary: body?.preferencesSummary,
        householdSummary: body?.householdSummary,
        specialOccasions: body?.specialOccasions,
        conciergeInterests: body?.conciergeInterests,
      });

      if (!customer) {
        return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, customer });
    }

    if (action === "detail") {
      const id = String(body?.id || "");
      if (!id) {
        return NextResponse.json({ ok: false, error: "Missing customer id" }, { status: 400 });
      }
      const customer = await getCustomerById(id);
      if (!customer) {
        return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, customer });
    }

    return NextResponse.json({ ok: false, error: "Unsupported customer action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update customer" },
      { status: 400 }
    );
  }
}
