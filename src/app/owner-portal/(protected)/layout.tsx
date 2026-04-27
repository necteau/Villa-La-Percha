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
    <main className="min-h-screen overflow-x-hidden bg-[#f6f4ef] text-[#1f1f1b]">
      <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 px-4 py-6 sm:px-6 md:px-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:py-12">
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <OwnerPortalNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
