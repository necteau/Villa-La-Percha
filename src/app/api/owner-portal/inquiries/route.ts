import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { listInquiries, updateInquiryStatus } from "@/lib/inquiries";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const inquiries = await listInquiries();
  return NextResponse.json({ ok: true, inquiries });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const id = String(body?.id || "");
    const status = body?.status;
    if (!id || !status) {
      return NextResponse.json({ ok: false, error: "Missing inquiry id or status" }, { status: 400 });
    }

    const inquiry = await updateInquiryStatus(id, status);
    if (!inquiry) {
      return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, inquiry });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update inquiry" },
      { status: 400 }
    );
  }
}
