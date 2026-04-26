import { NextResponse } from "next/server";
import { OWNER_SESSION_COOKIE } from "@/lib/ownerAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: OWNER_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/owner-portal",
  });
  return response;
}
