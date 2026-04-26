import { NextResponse } from "next/server";
import {
  createOwnerSessionToken,
  getOwnerCredentials,
  OWNER_SESSION_COOKIE,
} from "@/lib/ownerAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    const credentials = getOwnerCredentials();

    if (email !== credentials.email.toLowerCase() || password !== credentials.password) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }

    const token = createOwnerSessionToken(credentials.email);
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: OWNER_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/owner-portal",
    });

    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
