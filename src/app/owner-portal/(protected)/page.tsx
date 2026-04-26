import Link from "next/link";

const cards = [
  {
    title: "Sites",
    body: "Manage each property profile, payment preferences, and operating settings.",
    href: "/owner-portal/sites",
  },
  {
    title: "Payments",
    body: "Choose Stripe, Zelle, Venmo, Cash App, or hybrid per property.",
    href: "/owner-portal/payments",
  },
  {
    title: "Reservations",
    body: "Calendar view with add/edit/delete and reservation details side panel.",
    href: "/owner-portal/reservations",
  },
  {
    title: "Pricing",
    body: "Edit direct/Airbnb/VRBO pricing windows, rates, and tax assumptions.",
    href: "/owner-portal/pricing",
  },
];

export default function OwnerPortalDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Owner dashboard</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Run each site from one place.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
          This portal now supports property-level controls for payment methods, reservation operations, and pricing management.
          Next layers are contracts, payout workflows, and deeper AI operations.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title} className="rounded-[28px] border border-[#e8e1d6] bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <h2 className="font-display text-3xl text-[#1b1a17]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5b554b]">{card.body}</p>
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
