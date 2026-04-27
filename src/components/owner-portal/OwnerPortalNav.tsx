import Link from "next/link";
import { getOwnerPortalStats } from "@/lib/ownerPortalDashboard";

const primaryNavItems = [
  { label: "Dashboard", href: "/owner-portal" },
  { label: "Reservations", href: "/owner-portal/reservations" },
  { label: "Inquiries", href: "/owner-portal/inquiries" },
  { label: "Customers", href: "/owner-portal/customers" },
];

const setupNavItems = [
  { label: "Sites", href: "/owner-portal/sites" },
  { label: "Payments", href: "/owner-portal/payments" },
  { label: "Pricing", href: "/owner-portal/pricing" },
];

export default async function OwnerPortalNav() {
  const stats = await getOwnerPortalStats();
  return (
    <aside className="w-full min-w-0 rounded-[28px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Owner Portal</p>
      <h2 className="mt-3 font-display text-3xl text-[#1b1a17]">DirectStay</h2>
      <nav className="mt-6 flex flex-col gap-2">
        {primaryNavItems.map((item) => {
          const showBadge = item.label === "Inquiries" && stats.inquiriesNew > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-0 items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[#3f3a33] transition hover:bg-[#f4efe6] sm:px-4"
            >
              <span className="min-w-0 truncate">{item.label}</span>
              {showBadge ? (
                <span className="shrink-0 rounded-full bg-[#1e4536] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  {stats.inquiriesNew} new
                </span>
              ) : null}
            </Link>
          );
        })}

        <details className="group rounded-2xl text-sm font-medium text-[#3f3a33]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#f4efe6] sm:px-4">
            <span>Setup</span>
            <span className="text-xs text-[#7b7468] transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-1 flex flex-col gap-1 pl-4">
            {setupNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-[#5b554b] transition hover:bg-[#f4efe6]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </nav>
      <Link
        href="/owner-portal/logout"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[#d8cebf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f4efe6]"
      >
        Log out
      </Link>
    </aside>
  );
}
