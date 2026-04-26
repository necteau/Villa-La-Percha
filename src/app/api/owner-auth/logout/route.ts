import { NextResponse } from "next/server";
import { createOwnerServerClient } from "@/lib/ownerAuth";

export async function POST() {
  const supabase = await createOwnerServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
