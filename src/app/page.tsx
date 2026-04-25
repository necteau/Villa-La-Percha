import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DirectStay | Direct booking infrastructure for vacation rental owners",
  description:
    "DirectStay helps vacation rental owners book more guests directly with premium booking sites, direct inquiry funnels, and AI-powered operating systems.",
  alternates: {
    canonical: "/",
  },
};

const pillars = [
  {
    title: "Guest-facing booking sites",
    body: "Standalone property sites that feel premium, credible, and easier to trust than another Airbnb or VRBO listing page.",
  },
  {
    title: "Direct conversion systems",
    body: "Inquiry flows, pricing comparisons, owner response workflows, and the operating layer needed to turn interest into booked stays.",
  },
  {
    title: "AI-powered operations",
    body: "Use AI to handle the repetitive work around hosting, lead response, pricing support, and property marketing without adding headcount.",
  },
];

const roadmap = [
  "Property websites and direct inquiry funnels",
  "Owner dashboards and response workflows",
  "Calendar, pricing, and booking operations",
  "A real alternative to marketplace-first vacation rental selling",
];

const audience = [
  "Independent owners with strong properties and no real direct presence",
  "Hosts who want repeat guests and referrals to book outside Airbnb and VRBO",
  "Hospitality brands that need more control over margin, conversion, and guest relationships",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1f1f1b]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto flex min-h-[74vh] w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">DirectStay</p>
          <h1 className="max-w-5xl font-display text-5xl leading-tight text-[#181612] md:text-7xl">
            The direct-booking operating system for vacation rental owners.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5b554b] md:text-xl">
            DirectStay helps owners reduce dependence on Airbnb and VRBO with polished guest-facing booking
            sites, stronger direct conversion, and AI-powered systems behind the scenes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="mailto:hello@directstay.app?subject=DirectStay%20owner%20inquiry"
              className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]"
            >
              Talk to DirectStay
            </a>
            <Link
              href="/villa-la-percha"
              className="inline-flex items-center justify-center rounded-full border border-[#1f1f1b]/15 px-7 py-3 text-sm font-semibold text-[#1f1f1b] transition hover:bg-[#f2efe8]"
            >
              View live property example
            </Link>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-[#7b7468]">
            Start with one high-converting direct site. Build toward a world where owners control the guest
            relationship, the margin, and the operating system.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-[28px] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
              <h2 className="font-display text-3xl text-[#1b1a17]">{pillar.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#5b554b]">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#efe8dc]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.05fr_0.95fr] md:px-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">Who this is for</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-[#181612] md:text-5xl">
              Owners with strong properties should not have to rely on marketplace pages as their whole brand.
            </h2>
            <ul className="mt-6 space-y-4 text-lg leading-8 text-[#5b554b]">
              {audience.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1e4536]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">What DirectStay becomes</p>
            <h3 className="mt-4 font-display text-3xl leading-tight text-[#1b1a17] md:text-4xl">
              Start with direct websites. Build toward a real marketplace alternative.
            </h3>
            <ul className="mt-6 space-y-4 text-base leading-7 text-[#5b554b]">
              {roadmap.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1e4536]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <div className="rounded-[36px] bg-[#1a1916] px-8 py-12 text-white md:px-12 md:py-16">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/60">Live example</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Villa La Percha</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
            A direct-booking villa site designed to show what happens when a property is positioned like a
            real hospitality brand instead of just another listing on someone else&apos;s platform.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/villa-la-percha"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#1a1916] transition hover:bg-[#f2efe8]"
            >
              Open the Villa La Percha site
            </Link>
            <a
              href="mailto:hello@directstay.app?subject=DirectStay%20demo%20request"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Request a site like this
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
