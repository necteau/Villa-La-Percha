import { NextResponse } from "next/server";
import { createPlatformLead, validatePlatformLeadInput } from "@/lib/platformLeads";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 4;
const requestLog = new Map<string, number[]>();

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const isFormPost = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
    const body = isFormPost ? Object.fromEntries((await req.formData()).entries()) : await req.json();

    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }

    const validation = validatePlatformLeadInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const lead = await createPlatformLead(validation.data);
    if (isFormPost) {
      return NextResponse.redirect(new URL("/thank-you", req.url), { status: 303 });
    }
    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (error) {
    console.error("PlatformLead intake failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
