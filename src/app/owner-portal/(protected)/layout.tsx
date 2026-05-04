import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import OwnerPortalNav from "@/components/owner-portal/OwnerPortalNav";
import { getSelectedAdminOwnerContext } from "@/lib/admin/ownerContext";
import { getOwnerSessionUser } from "@/lib/ownerAuth";

export default async function OwnerPortalProtectedLayout({ children }: { children: ReactNode }) {
  const user = await getOwnerSessionUser();

  if (!user) {
    redirect("/owner-portal/login");
  }

  const adminContext = await getSelectedAdminOwnerContext().catch(() => null);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f4ef] text-[#1f1f1b]">
      {adminContext ? (
        <div className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-950 sm:px-6 md:px-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <strong>Admin mode: viewing {adminContext.ownerName}</strong>
            <form action="/admin/owner-context/exit" method="post">
              <button className="rounded-full bg-amber-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-50" type="submit">
                Exit admin mode
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 px-4 py-6 sm:px-6 md:px-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:py-12">
        <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <OwnerPortalNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
