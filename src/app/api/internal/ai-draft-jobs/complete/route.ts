import { NextResponse } from "next/server";
import { completeAiDraftUpgrade, isInternalAiRequest } from "@/lib/aiDraftJobs";

export async function POST(req: Request) {
  if (!isInternalAiRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const draftId = typeof body?.draftId === "string" ? body.draftId : "";
  const responseBody = typeof body?.body === "string" ? body.body.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : undefined;
  const modelUsed = typeof body?.modelUsed === "string" ? body.modelUsed.trim() : "unknown";

  if (!draftId || !responseBody) {
    return NextResponse.json({ ok: false, error: "Missing draft id or body" }, { status: 400 });
  }

  try {
    const result = await completeAiDraftUpgrade({ draftId, subject, body: responseBody, modelUsed });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to complete AI draft upgrade" },
      { status: 400 }
    );
  }
}
