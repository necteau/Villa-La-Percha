import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_SESSION_COOKIE } from "@/lib/ownerAuth";

export default async function OwnerPortalLogoutPage() {
  const cookieStore = await cookies();
  cookieStore.set({ name: OWNER_SESSION_COOKIE, value: "", maxAge: 0, path: "/owner-portal" });
  redirect("/owner-portal/login");
}
