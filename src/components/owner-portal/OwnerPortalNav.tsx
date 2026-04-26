import Link from "next/link";
import { getOwnerPortalStats } from "@/lib/ownerPortalDashboard";

const navItems = [
  { label: "Dashboard", href: "/owner-portal" },
  { label: "Sites", href: "/owner-portal/sites" },
  { label: "Payments", href: "/owner-portal/payments" },
  { label: "Reservations", href: "/owner-portal/reservations" },
  { label: "Pricing", href: "/owner-portal/pricing" },
  { label: "Inquiries", href: "/owner-portal/inquiries" },
];

export default async function OwnerPortalNav() {
  const stats = await getOwnerPortalStats();
  return (
    <aside className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Owner Portal</p>
      <h2 className="mt-3 font-display text-3xl text-[#1b1a17]">DirectStay</h2>
      <nav className="mt-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const showBadge = item.label === "Inquiries" && stats.inquiriesNew > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[#3f3a33] transition hover:bg-[#f4efe6]"
            >
              <span>{item.label}</span>
              {showBadge ? (
                <span className="rounded-full bg-[#1e4536] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  {stats.inquiriesNew} new
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 rounded-2xl bg-[#f6f2ea] p-4 text-sm leading-6 text-[#5b554b]">
        Start with site controls, reservations, and pricing. Layer in contracts, payouts, and AI tools over time.
      </div>
      <Link
        href="/owner-portal/logout"
        className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#d8cebf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f4efe6]"
      >
        Log out
      </Link>
    </aside>
  );
}
