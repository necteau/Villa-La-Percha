import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import OwnerPortalNav from "@/components/owner-portal/OwnerPortalNav";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

export default async function OwnerPortalProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getOwnerSessionUser();

  if (!user) {
    redirect("/owner-portal/login");
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1f1f1b]">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:px-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-12">
        <div className="lg:sticky lg:top-8 lg:self-start">
          <OwnerPortalNav />
        </div>
        <div>{children}</div>
      </div>
    </main>
  );
}
