import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DirectStay | Direct booking sites and AI operations for vacation rentals",
  description:
    "DirectStay helps vacation rental owners book more guests directly with polished booking sites, direct inquiry funnels, and AI-powered owner operations.",
  alternates: {
    canonical: "/",
  },
};

const pillars = [
  {
    title: "Direct booking sites",
    body: "Beautiful guest-facing sites that make a property feel premium, credible, and easier to book outside Airbnb and VRBO.",
  },
  {
    title: "Owner operations",
    body: "Inquiry handling, pricing support, response workflows, and the operational systems owners need once direct demand starts coming in.",
  },
  {
    title: "AI leverage",
    body: "Use AI to handle the repetitive parts of hosting and marketing so owners can grow revenue without growing busywork.",
  },
];

const roadmap = [
  "Property landing pages and direct inquiry funnels",
  "Owner dashboards and lead-response workflows",
  "Calendar, pricing, and booking operations",
  "A true alternative to marketplace-first vacation rental selling",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1f1f1b]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto flex min-h-[72vh] w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">DirectStay</p>
          <h1 className="max-w-4xl font-display text-5xl leading-tight text-[#181612] md:text-7xl">
            Direct booking infrastructure for the next generation of vacation rental brands.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5b554b] md:text-xl">
            We help owners and independent hospitality brands reduce dependence on Airbnb and VRBO with
            guest-facing booking sites, better direct conversion, and AI-powered operating systems behind the scenes.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/villa-la-percha"
              className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]"
            >
              View Villa La Percha example
            </Link>
            <a
              href="mailto:hello@directstay.app?subject=DirectStay%20inquiry"
              className="inline-flex items-center justify-center rounded-full border border-[#1f1f1b]/15 px-7 py-3 text-sm font-semibold text-[#1f1f1b] transition hover:bg-[#f2efe8]"
            >
              Talk to DirectStay
            </a>
          </div>
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
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7b7468]">What DirectStay becomes</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-[#181612] md:text-5xl">
              Start with high-converting direct booking sites. Build toward a real marketplace alternative.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5b554b]">
              The wedge is simple: help owners win back direct demand. The long-term opportunity is bigger:
              a modern platform where owners manage properties, inquiries, pricing, and guest relationships without
              handing away margin or control.
            </p>
          </div>
          <div className="rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
            <h3 className="font-display text-3xl text-[#1b1a17]">Roadmap</h3>
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
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/60">Current example</p>
          <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Villa La Percha</h2>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
            A direct-booking villa site designed to show what happens when a property is positioned like a real brand,
            not just another marketplace listing.
          </p>
          <div className="mt-8">
            <Link
              href="/villa-la-percha"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#1a1916] transition hover:bg-[#f2efe8]"
            >
              Open the Villa La Percha site
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
