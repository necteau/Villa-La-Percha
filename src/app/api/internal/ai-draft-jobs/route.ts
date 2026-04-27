import { NextResponse } from "next/server";
import { isInternalAiRequest, listPendingAiDraftJobs, markAiDraftAttempt } from "@/lib/aiDraftJobs";

export async function GET(req: Request) {
  if (!isInternalAiRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") || 10);
  const jobs = await listPendingAiDraftJobs(limit);
  return NextResponse.json({ ok: true, jobs });
}

export async function PATCH(req: Request) {
  if (!isInternalAiRequest(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const draftId = typeof body?.draftId === "string" ? body.draftId : "";
  if (!draftId) {
    return NextResponse.json({ ok: false, error: "Missing draft id" }, { status: 400 });
  }

  await markAiDraftAttempt(draftId, typeof body?.error === "string" ? body.error : undefined);
  return NextResponse.json({ ok: true });
}
