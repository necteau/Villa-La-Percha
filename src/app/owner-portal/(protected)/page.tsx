import Link from "next/link";
import { getOwnerPortalStats } from "@/lib/ownerPortalDashboard";

export default async function OwnerPortalDashboardPage() {
  const stats = await getOwnerPortalStats();

  const summaryCards = [
    {
      label: "Upcoming reservations",
      value: String(stats.reservationsUpcoming),
      note: `${stats.reservationsTotal} total reservations · ${stats.ownerWeeks} owner weeks`,
    },
    {
      label: "New inquiries",
      value: String(stats.inquiriesNew),
      note: `${stats.inquiriesUnreplied} awaiting reply or closure · ${stats.inquiriesTotal} total`,
    },
    {
      label: "Direct nightly rate",
      value: stats.directPricingNightly ? `$${Math.round(stats.directPricingNightly).toLocaleString()}` : "—",
      note: `${stats.pricingWindows} pricing windows currently configured`,
    },
  ];

  const cards = [
    {
      title: "Sites",
      body: "Manage each property profile, payment preferences, and operating settings.",
      href: "/owner-portal/sites",
      stat: `${stats.reservationsUpcoming} upcoming stays using current site rules`,
    },
    {
      title: "Payments",
      body: "Choose Stripe, Zelle, Venmo, Cash App, or hybrid per property.",
      href: "/owner-portal/payments",
      stat: `${stats.directPricingNightly ? `$${Math.round(stats.directPricingNightly).toLocaleString()}` : "Current"} direct nightly baseline`,
    },
    {
      title: "Reservations",
      body: "Calendar view with add/edit/delete and reservation details side panel.",
      href: "/owner-portal/reservations",
      stat: `${stats.reservationsTotal} total reservations · ${stats.ownerWeeks} owner weeks`,
    },
    {
      title: "Pricing",
      body: "Edit direct/Airbnb/VRBO pricing windows, rates, and tax assumptions.",
      href: "/owner-portal/pricing",
      stat: `${stats.pricingWindows} pricing windows live`,
    },
    {
      title: "Inquiries",
      body: "Review incoming guest inquiries and move them through reply, approval, or conversion.",
      href: "/owner-portal/inquiries",
      stat: `${stats.inquiriesNew} new · ${stats.inquiriesUnreplied} open conversations`,
      badge: stats.inquiriesNew > 0 ? `${stats.inquiriesNew} new` : undefined,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Owner dashboard</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Run each site from one place.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
          This portal now supports property-level controls for payment methods, reservation operations, pricing management,
          and inquiry triage. The useful bits now surface first instead of hiding behind five clicks like a guilty intern.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">{card.label}</p>
            <p className="mt-3 font-display text-5xl text-[#181612]">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-[#5b554b]">{card.note}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-[28px] border border-[#e8e1d6] bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-3xl text-[#1b1a17]">{card.title}</h2>
              {card.badge ? (
                <span className="rounded-full bg-[#1e4536] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                  {card.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5b554b]">{card.body}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-[#7b7468]">{card.stat}</p>
            <Link
              href={card.href}
              className="mt-6 inline-flex rounded-full bg-[#1e4536] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Open {card.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
