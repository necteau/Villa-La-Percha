import { redirect } from "next/navigation";
import { createOwnerServerClient } from "@/lib/ownerAuth";

export const dynamic = "force-dynamic";

export default async function OwnerPortalLogoutPage() {
  const supabase = await createOwnerServerClient();
  await supabase.auth.signOut();
  redirect("/owner-portal/login");
}
