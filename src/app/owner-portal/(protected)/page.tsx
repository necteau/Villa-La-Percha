import Link from "next/link";
import { getOwnerPortalStats } from "@/lib/ownerPortalDashboard";

export default async function OwnerPortalDashboardPage() {
  const stats = await getOwnerPortalStats();

  const needsAttention = stats.inquiriesNeedsReply;
  const awaitingGuest = stats.inquiriesAwaitingGuest;
  const openInquiries = needsAttention + awaitingGuest;
  const responseSpeed = stats.avgFirstResponseHours !== null ? `${stats.avgFirstResponseHours.toFixed(1)}h` : "—";

  const priorityActions = [
    {
      title: needsAttention > 0 ? "Reply to guest inquiries" : "No guest replies waiting",
      body: needsAttention > 0
        ? `${needsAttention} inquiry${needsAttention === 1 ? " needs" : " inquiries need"} an owner response. Start here first.`
        : "Your active inbox is clear. New guest replies will appear here automatically.",
      href: "/owner-portal/inquiries?status=needs_reply",
      cta: needsAttention > 0 ? "Review needs reply" : "Open inquiries",
      tone: needsAttention > 0 ? "urgent" : "calm",
    },
    {
      title: "Track awaiting guests",
      body: `${awaitingGuest} conversation${awaitingGuest === 1 ? " is" : "s are"} waiting on the guest. Check elapsed sent time and follow up when needed.`,
      href: "/owner-portal/inquiries?status=awaiting_guest",
      cta: "View awaiting guest",
      tone: awaitingGuest > 0 ? "watch" : "calm",
    },
    {
      title: "Manage upcoming stays",
      body: `${stats.reservationsUpcoming} upcoming reservation${stats.reservationsUpcoming === 1 ? "" : "s"}. Confirm dates, revenue, and owner weeks from the reservation calendar.`,
      href: "/owner-portal/reservations",
      cta: "Open reservations",
      tone: "calm",
    },
  ];

  const operatingSnapshot = [
    { label: "Needs reply", value: String(needsAttention), note: "Guest is waiting on owner" },
    { label: "Awaiting guest", value: String(awaitingGuest), note: "Owner has replied" },
    { label: "Booked inquiries", value: String(stats.inquiriesBooked), note: `${stats.inquiryConversionRate !== null ? `${Math.round(stats.inquiryConversionRate * 100)}%` : "—"} conversion rate` },
    { label: "Closed inquiries", value: String(stats.inquiriesClosed), note: "Archived or no longer active" },
  ];

  const managementLinks = [
    {
      title: "Inquiries",
      href: "/owner-portal/inquiries",
      body: "Triage guest conversations, revise AI drafts, send replies, confirm bookings, close or reopen inquiries.",
      stat: `${openInquiries} active · ${stats.inquiriesClosed} closed`,
    },
    {
      title: "Reservations",
      href: "/owner-portal/reservations",
      body: "View and edit confirmed stays, dates, income, guest details, and owner weeks.",
      stat: `${stats.reservationsUpcoming} upcoming · ${stats.reservationsTotal} total`,
    },
    {
      title: "Customers",
      href: "/owner-portal/customers",
      body: "Review guest profiles, prior inquiries, reservation history, preferences, and repeat/VIP relationships.",
      stat: `${stats.customersTotal} customers · ${stats.repeatGuests} repeat/VIP`,
    },
    {
      title: "Pricing",
      href: "/owner-portal/pricing",
      body: "Maintain direct, Airbnb, and VRBO rate assumptions used in comparisons and inquiry revenue estimates.",
      stat: `${stats.pricingWindows} windows · ${stats.directPricingNightly ? `$${Math.round(stats.directPricingNightly).toLocaleString()}/night direct` : "direct rate pending"}`,
    },
    {
      title: "Setup",
      href: "/owner-portal/sites",
      body: "Edit property details, owner AI reply instructions, and operating settings for the DirectStay site.",
      stat: "Property controls",
    },
    {
      title: "Payments",
      href: "/owner-portal/payments",
      body: "Manage accepted payment methods and owner payment preferences before payment automation is added.",
      stat: "Payment settings",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Owner dashboard</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-5xl leading-tight text-[#181612]">Today’s booking desk</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
              Everything that needs owner attention, plus one-click access to the workflows that turn guest interest into booked stays.
            </p>
          </div>
          <Link href="/owner-portal/inquiries" className="rounded-full bg-[#1e4536] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Open inquiry queue
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Priority actions</p>
              <h2 className="mt-2 font-display text-3xl text-[#181612]">Start here</h2>
            </div>
            <p className="text-sm text-[#7b7468]">Avg first response: <span className="font-semibold text-[#1b1a17]">{responseSpeed}</span></p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {priorityActions.map((action) => (
              <article key={action.title} className={`rounded-2xl border p-5 ${action.tone === "urgent" ? "border-[#1e4536] bg-[#eef6f1]" : action.tone === "watch" ? "border-[#dccfbf] bg-[#f6f2ea]" : "border-[#e8e1d6] bg-[#faf8f3]"}`}>
                <h3 className="font-display text-2xl text-[#181612]">{action.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b554b]">{action.body}</p>
                <Link href={action.href} className="mt-5 inline-flex rounded-full bg-[#1e4536] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                  {action.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Operating snapshot</p>
          <div className="mt-5 space-y-3">
            {operatingSnapshot.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf8f3] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#1b1a17]">{item.label}</p>
                  <p className="text-xs text-[#7b7468]">{item.note}</p>
                </div>
                <p className="font-display text-3xl text-[#181612]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {managementLinks.map((card) => (
          <article key={card.title} className="rounded-[28px] border border-[#e8e1d6] bg-white p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <h2 className="font-display text-3xl text-[#1b1a17]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5b554b]">{card.body}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-[#7b7468]">{card.stat}</p>
            <Link href={card.href} className="mt-6 inline-flex rounded-full border border-[#1e4536] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1e4536]">
              Open {card.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
