import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DirectStay | Book exceptional vacation homes direct",
  description:
    "DirectStay connects guests with premium vacation homes they can book directly with owners — fewer platform fees, clearer communication, AI-assisted operations, and a more personal stay.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DirectStay | Book exceptional vacation homes direct",
    description:
      "Premium vacation homes, direct owner relationships, and a cleaner booking experience without marketplace friction.",
    url: "/",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha in Providenciales",
      },
    ],
  },
};

const guestBenefits = [
  "Book directly with the property team instead of through a marketplace queue.",
  "Avoid the inflated platform-fee stack that can make luxury rentals feel needlessly expensive.",
  "Get local planning notes, beach guidance, and arrival details from people who know the home.",
];

const ownerBenefits = [
  "A polished property site that looks like a real hospitality brand, not a copied listing.",
  "AI-assisted inquiry, pricing, calendar, and payment workflows designed for direct conversion.",
  "Guest relationships, repeat bookings, and operating data that stay with the owner.",
];

// TODO: Change DirectStay contact mailto links back to a branded DirectStay inbox once the public contact mailbox is finalized.
const trustPoints = [
  { value: "Direct", label: "Owner-led booking path" },
  { value: "Lower", label: "Marketplace dependency" },
  { value: "Better", label: "Guest relationship" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f3ec] text-[#1f1f1b]">
      <section className="relative overflow-hidden bg-[#10261f] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/aerial-house-ocean-neighbors.jpg"
            alt="DirectStay featured vacation home"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10261f] via-[#10261f]/86 to-[#10261f]/35" />
        </div>

        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-6 py-20 md:px-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-white/70">DirectStay</p>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">
              Premium vacation homes, booked direct.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/82 md:text-xl">
              DirectStay helps guests book exceptional private homes without the marketplace runaround — and gives owners AI-assisted tools to build a real direct-booking business.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/villa-la-percha"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#10261f] transition hover:bg-[#f2efe8]"
              >
                View Villa La Percha
              </Link>
              <a
                href="mailto:necteau@gmail.com?subject=DirectStay%20owner%20inquiry"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                List with DirectStay
              </a>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md md:p-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[26px]">
              <Image src="/images/pool-lounge-ocean.jpg" alt="Luxury villa pool with ocean view" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-5 text-center">
              {trustPoints.map((point) => (
                <div key={point.label} className="rounded-2xl bg-white/12 px-3 py-4">
                  <p className="font-display text-2xl">{point.value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/65">{point.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[32px] bg-white p-8 shadow-[0_18px_55px_rgba(31,31,27,0.07)] lg:col-span-2 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">For guests</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-[#181612] md:text-5xl">
              A more personal way to book homes worth traveling for.
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {guestBenefits.map((item) => (
                <li key={item} className="rounded-2xl border border-[#e8e0d2] bg-[#fbfaf7] p-5 text-sm leading-6 text-[#5b554b]">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[32px] bg-[#1a1916] p-8 text-white shadow-[0_18px_55px_rgba(31,31,27,0.12)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Featured stay</p>
            <h2 className="mt-4 font-display text-4xl leading-tight">Villa La Percha</h2>
            <p className="mt-5 text-base leading-7 text-white/72">
              A private Chalk Sound villa in Providenciales with four en-suite bedrooms, dock swimming, kayaks, paddleboards, pool, hot tub, and a direct booking path.
            </p>
            <Link href="/villa-la-percha" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1916] transition hover:bg-[#f2efe8]">
              Open property site
            </Link>
          </article>
        </div>
      </section>

      <section className="border-y border-black/5 bg-[#efe8dc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:px-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[380px] overflow-hidden rounded-[36px] shadow-[0_18px_55px_rgba(31,31,27,0.12)]">
            <Image src="/images/screened-living-room-ocean-pool.jpg" alt="Indoor outdoor villa living space" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
          </div>
          <div className="self-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">For owners</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-[#181612] md:text-5xl">
              Turn a great property into a direct-booking brand.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5b554b]">
              DirectStay is built for owners who want more control over guest relationships, pricing, presentation, repeat bookings, and AI-assisted operations — without asking travelers to trust a barebones landing page.
            </p>
            <ul className="mt-7 space-y-4 text-base leading-7 text-[#5b554b]">
              {ownerBenefits.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1e4536]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] bg-[#10261f] p-8 text-white shadow-[0_18px_55px_rgba(31,31,27,0.12)] md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">AI operations</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">A smarter back office for direct stays.</h2>
          </div>
          <div className="rounded-[32px] bg-white p-8 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-10">
            <p className="text-lg leading-8 text-[#5b554b]">
              DirectStay is designed to use AI where it actually helps owners: summarizing inquiries, drafting guest replies, surfacing missing details, tracking lead quality, and keeping booking operations organized without making the guest experience feel robotic.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="rounded-[40px] bg-white p-8 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">DirectStay network</p>
              <h2 className="mt-4 font-display text-4xl leading-tight text-[#181612] md:text-5xl">
                Starting with select homes. Built to grow carefully.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5b554b]">
                We are focused on properties where the direct experience can genuinely be better: strong homes, clear guest communication, useful local guidance, AI-supported response workflows, and owners who care about the stay after the booking is made.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <Link href="/villa-la-percha/experience-the-island" className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#18372b]">
                Explore the island guide
              </Link>
              <a href="mailto:necteau@gmail.com?subject=DirectStay%20inquiry" className="inline-flex items-center justify-center rounded-full border border-[#1f1f1b]/15 px-7 py-3 text-sm font-semibold text-[#1f1f1b] transition hover:bg-[#f2efe8]">
                Contact DirectStay
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
