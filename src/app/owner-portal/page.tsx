import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Owner Portal",
  description:
    "A preview of the DirectStay owner portal for configuring payments, guest inquiry workflows, and property operations.",
  alternates: {
    canonical: "/owner-portal",
  },
};

const paymentOptions = [
  {
    title: "Stripe",
    description: "Accept cards or bank payments with a cleaner, more professional guest checkout.",
    status: "Recommended primary",
  },
  {
    title: "Zelle",
    description: "Manual direct transfer option for owners who want guests paying them directly after approval.",
    status: "Manual / owner-directed",
  },
  {
    title: "Venmo",
    description: "Useful as an optional fallback or lighter-weight payment method for approved bookings.",
    status: "Optional",
  },
  {
    title: "Cash App",
    description: "Another configurable direct-pay fallback when an owner prefers it.",
    status: "Optional",
  },
];

const modules = [
  "Payment methods enabled per property",
  "Deposit percentage and payment schedule",
  "Inquiry notifications and response workflow",
  "Property-specific booking rules and minimum stays",
  "Owner notes, tasks, and booking operations visibility",
  "Eventually: contracts, reminders, payouts, and AI ops controls",
];

const sampleSites = [
  {
    name: "Villa La Percha",
    status: "Direct inquiry live",
    payments: ["Stripe (planned)", "Zelle", "Venmo on request"],
  },
  {
    name: "Future owner site",
    status: "Configuration template",
    payments: ["Stripe", "Cash App", "Zelle"],
  },
];

export default function OwnerPortalPage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1f1f1b]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">DirectStay Owner Portal</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-tight text-[#181612] md:text-7xl">
            One control center for how each owner site actually runs.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5b554b] md:text-xl">
            The end state is configurable per property: payment methods, inquiry flow, booking rules,
            owner preferences, and the operating layer behind each DirectStay site.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/villa-la-percha"
              className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]"
            >
              View live property example
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[#1f1f1b]/15 px-7 py-3 text-sm font-semibold text-[#1f1f1b] transition hover:bg-[#f2efe8]"
            >
              Back to DirectStay
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">Per-site payment configuration</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#1b1a17]">Support all the payment options, but let each owner choose.</h2>
            <p className="mt-5 text-base leading-7 text-[#5b554b]">
              Some owners will want Stripe as the primary path. Others will insist on Zelle, Venmo, or Cash App.
              The portal should let each property decide which methods are shown, which is primary, and what guest flow follows approval.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <article key={option.title} className="rounded-[24px] border border-[#e7e0d6] bg-[#faf8f3] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">{option.status}</p>
                  <h3 className="mt-2 font-display text-2xl text-[#1b1a17]">{option.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5b554b]">{option.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-[#efe8dc] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] md:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">Initial portal modules</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#1b1a17]">Start simple. Keep adding owner controls over time.</h2>
            <ul className="mt-6 space-y-4 text-base leading-7 text-[#5b554b]">
              {modules.map((module) => (
                <li key={module} className="flex gap-3">
                  <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1e4536]" />
                  <span>{module}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">How this evolves</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#181612] md:text-5xl">
              DirectStay should become the owner-facing operating layer, not just the marketing site.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5b554b]">
              The portal is where we can keep adding value: configuration, visibility, automation, and eventually the AI tools that make owners feel like they finally have a real system instead of scattered tools and inbox threads.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {sampleSites.map((site) => (
              <article key={site.name} className="rounded-[28px] border border-[#ebe3d8] bg-[#faf8f3] p-7">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">{site.status}</p>
                <h3 className="mt-3 font-display text-3xl text-[#1b1a17]">{site.name}</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {site.payments.map((payment) => (
                    <span key={payment} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#4c473f] border border-[#e7e0d6]">
                      {payment}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
