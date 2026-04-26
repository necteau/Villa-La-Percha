import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createInquiry } from "@/lib/inquiries";
import { trackInquirySubmit } from "@/lib/analytics";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, number[]>();

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Villa La Percha <onboarding@resend.dev>";
}

function getInquiryNotificationRecipients(): string[] {
  const configured = process.env.INQUIRY_NOTIFICATION_EMAIL || process.env.INQUIRY_REPLY_TO_EMAIL || "necteau@gmail.com";
  return configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidDateRange(checkIn: string, checkOut: string) {
  if (!DATE_REGEX.test(checkIn) || !DATE_REGEX.test(checkOut)) return false;
  return checkOut > checkIn;
}

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
    const body = await req.json();
    const { fullName, email, checkIn, checkOut, comments, website } = body;

    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!fullName || !email || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const safeName = String(fullName).trim();
    const safeEmail = String(email).trim().toLowerCase();
    const safeCheckIn = String(checkIn).trim();
    const safeCheckOut = String(checkOut).trim();
    const safeComments = typeof comments === "string" ? comments.trim() : "";

    if (!EMAIL_REGEX.test(safeEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (!isValidDateRange(safeCheckIn, safeCheckOut)) {
      return NextResponse.json({ error: "Please enter valid travel dates" }, { status: 400 });
    }

    if (safeName.length > 120 || safeComments.length > 4000) {
      return NextResponse.json({ error: "Inquiry is too long" }, { status: 400 });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many inquiries. Please try again shortly." }, { status: 429 });
    }

    const inquiry = await createInquiry({
      fullName: safeName,
      email: safeEmail,
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      message: safeComments || undefined,
    });

    // Track conversion funnel event (fire-and-forget)
    void trackInquirySubmit(inquiry.id, {
      fullName: safeName,
      checkIn: safeCheckIn,
      checkOut: safeCheckOut,
      messageLength: safeComments.length,
    }).catch(() => {});

    const subject = `Villa La Percha Inquiry — ${safeName} — ${safeCheckIn} to ${safeCheckOut}`;

    const escapedName = escapeHtml(safeName);
    const escapedEmail = escapeHtml(safeEmail);
    const escapedCheckIn = escapeHtml(safeCheckIn);
    const escapedCheckOut = escapeHtml(safeCheckOut);
    const escapedComments = escapeHtml(safeComments);

    const html = `
      <h2>New Villa La Percha Inquiry</h2>
      <p><strong>Name:</strong> ${escapedName}</p>
      <p><strong>Email:</strong> ${escapedEmail}</p>
      <p><strong>Check-in:</strong> ${escapedCheckIn}</p>
      <p><strong>Check-out:</strong> ${escapedCheckOut}</p>
      ${safeComments ? `<p><strong>Comments:</strong> ${escapedComments.replaceAll("\n", "<br />")}</p>` : ""}
      <p><em>Sent from villa-la-percha.vercel.app</em></p>
    `;

    const text = [
      `New Villa La Percha Inquiry`,
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Check-in: ${safeCheckIn}`,
      `Check-out: ${safeCheckOut}`,
      safeComments ? `Comments: ${safeComments}` : "Comments: None",
      "",
      "Sent from villa-la-percha.vercel.app",
    ].join("\n");

    if (!resend) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
    }

    const result = await resend.emails.send({
      from: getFromAddress(),
      to: getInquiryNotificationRecipients(),
      subject,
      html,
      text,
      replyTo: process.env.INQUIRY_REPLY_TO_EMAIL || undefined,
    });

    if (result.error) {
      console.error("Inquiry notification email failed", {
        inquiryId: inquiry.id,
        error: result.error.message,
      });

      return NextResponse.json({
        ok: true,
        warning: "Inquiry saved, but notification email could not be delivered.",
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
