import { NextResponse } from "next/server";
import { acceptGuestContract, publicContractUrl } from "@/lib/guestContracts";

export async function POST(req: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  const form = await req.formData();
  const token = String(form.get("token") || "");
  const signerName = String(form.get("signerName") || "").trim();
  const signerEmail = String(form.get("signerEmail") || "").trim();
  const acceptedTerms = String(form.get("acceptedTerms") || "") === "yes";

  if (!signerName || !signerEmail || !acceptedTerms) {
    return NextResponse.json({ ok: false, error: "Name, email, and agreement checkbox are required." }, { status: 400 });
  }

  try {
    const accepted = await acceptGuestContract({
      contractId,
      token,
      signerName,
      signerEmail,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
      userAgent: req.headers.get("user-agent"),
    });
    return NextResponse.redirect(publicContractUrl(accepted.id, accepted.template.bodyHash), { status: 303 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unable to accept agreement." }, { status: 400 });
  }
}
