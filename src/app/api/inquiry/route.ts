import { NextResponse } from "next/server";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, checkIn, checkOut, comments } = body;

    if (!fullName || !email || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subject = `Villa La Percha Inquiry — ${fullName} — ${checkIn} to ${checkOut}`;

    const html = `
      <h2>New Villa La Percha Inquiry</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Check-in:</strong> ${checkIn}</p>
      <p><strong>Check-out:</strong> ${checkOut}</p>
      ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ""}
      <p><em>Sent from villa-la-percha.vercel.app</em></p>
    `;

    const text = [
      `New Villa La Percha Inquiry`,
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      comments ? `Comments: ${comments}` : "Comments: None",
      "",
      "Sent from villa-la-percha.vercel.app",
    ].join("\n");

    if (!resend) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
    }

    const result = await resend.emails.send({
      from: "Villa La Percha <hello@resend.villa-la-percha.vercel.app>",
      to: ["VillaLaPercha@gmail.com"],
      subject,
      html,
      text,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
