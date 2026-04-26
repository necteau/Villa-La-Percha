import { NextResponse } from "next/server";
import { createOwnerServerClient, isAllowedOwnerEmail } from "@/lib/ownerAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    if (!isAllowedOwnerEmail(email)) {
      return NextResponse.json({ ok: false, error: "This account is not authorized for the owner portal" }, { status: 403 });
    }

    const supabase = await createOwnerServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return NextResponse.json({ ok: false, error: error?.message || "Invalid email or password" }, { status: 401 });
    }

    if (!isAllowedOwnerEmail(data.user.email)) {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: false, error: "This account is not authorized for the owner portal" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, user: { email: data.user.email } });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
