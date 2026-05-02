import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DirectStay | AI-assisted direct booking for exceptional vacation homes",
  description:
    "DirectStay helps premium vacation rental owners turn their homes into direct-booking brands with better guest conversations, AI-assisted operations, and less marketplace dependency.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DirectStay | AI-assisted direct booking for exceptional vacation homes",
    description:
      "A direct-booking operating layer for premium vacation homes: clearer guest communication, lower marketplace dependency, and owner-controlled relationships.",
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

const proofPoints = [
  { value: "Direct", label: "guest relationship" },
  { value: "AI", label: "inquiry copilot" },
  { value: "Owner", label: "controlled brand" },
  { value: "Local", label: "stay guidance" },
];

const conversionFeatures = [
  {
    title: "Guest-fit conversations",
    body: "Guide travelers from vague interest to a confident inquiry with clear property answers, local context, and missing-detail prompts.",
  },
  {
    title: "Reply drafts worth approving",
    body: "Summaries, lead signals, pricing context, and reply options give owners a faster first response without handing over the relationship.",
  },
  {
    title: "A property site that sells the stay",
    body: "DirectStay pages can carry the story, guide, photos, policies, and owner-specific operating details that marketplaces flatten.",
  },
];

const ownerControls = [
  "Availability and pricing context",
  "Payment and deposit terms",
  "House rules and brand tone",
  "Local recommendations",
  "Approved reply workflows",
  "Guest CRM history",
];

const journey = [
  ["01", "Traveler asks", "The site captures what the guest wants: dates, group, objections, expectations, and what would make the stay a yes."],
  ["02", "DirectStay assists", "AI organizes the inquiry, flags missing details, and prepares owner-safe responses grounded in property data."],
  ["03", "Owner approves", "The owner keeps control of pricing, tone, terms, and final communication instead of surrendering the relationship to a marketplace."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f1e8] text-[#101828]">
      <section className="relative isolate px-5 py-5 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_86%_4%,rgba(244,114,88,0.20),transparent_26%)]" />
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-black/10 bg-[#fffaf2]/80 shadow-[0_28px_90px_rgba(16,24,40,0.12)] backdrop-blur md:rounded-[3rem]">
          <header className="flex flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="inline-flex items-center gap-3 text-sm font-black tracking-tight text-[#101828]">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#101828] text-white">DS</span>
              <span>DirectStay</span>
            </Link>
            <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[#475467]">
              <a href="#platform" className="rounded-full px-4 py-2 hover:bg-white">Platform</a>
              <a href="#owners" className="rounded-full px-4 py-2 hover:bg-white">Owners</a>
              <a href="#ai" className="rounded-full px-4 py-2 hover:bg-white">AI ops</a>
              <a href="#property" className="rounded-full px-4 py-2 hover:bg-white">First home</a>
            </nav>
            <a href="mailto:necteau@gmail.com?subject=DirectStay%20owner%20inquiry" className="inline-flex items-center justify-center rounded-full bg-[#2563eb] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8]">
              List with DirectStay
            </a>
          </header>

          <div className="grid gap-10 px-5 pb-8 pt-8 sm:px-8 md:pb-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-12 lg:pb-16 lg:pt-12">
            <div>
              <div className="inline-flex rounded-full border border-[#2563eb]/20 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#2563eb]">
                Direct-booking operating layer
              </div>
              <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl leading-[0.9] tracking-[-0.07em] text-[#101828] sm:text-6xl lg:text-7xl">
                Turn exceptional homes into direct-booking brands.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#475467]">
                DirectStay helps owners move beyond copied marketplace listings with a premium guest experience, AI-assisted inquiry workflows, and direct relationships that belong to the property — not the platform.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="mailto:necteau@gmail.com?subject=DirectStay%20owner%20inquiry" className="inline-flex items-center justify-center rounded-full bg-[#101828] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#263142]">
                  Build my direct-booking site
                </a>
                <Link href="/villa-la-percha" className="inline-flex items-center justify-center rounded-full border border-[#101828]/15 bg-white px-7 py-4 text-sm font-bold text-[#101828] transition hover:border-[#2563eb]/30 hover:text-[#2563eb]">
                  View Villa La Percha
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {proofPoints.map((point) => (
                  <div key={point.label} className="rounded-3xl border border-black/10 bg-white p-4">
                    <p className="font-display text-2xl tracking-[-0.05em] text-[#101828]">{point.value}</p>
                    <p className="mt-1 text-xs font-semibold text-[#667085]">{point.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-[#fb735c]/25 blur-2xl md:block" />
              <div className="relative rounded-[2rem] border border-black/10 bg-[#101828] p-3 shadow-[0_28px_90px_rgba(16,24,40,0.26)] md:rounded-[2.5rem]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
                  <Image src="/images/aerial-house-pool-ocean.jpg" alt="Premium vacation home pool and ocean view" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 48vw" />
                </div>
                <div className="mt-3 rounded-[1.5rem] bg-white p-4 text-[#101828]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2563eb]">Inquiry copilot</p>
                      <h2 className="mt-1 font-display text-2xl tracking-[-0.05em]">Family of 8 · July week</h2>
                    </div>
                    <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#166534]">High intent</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[#475467]">
                    <p className="rounded-2xl bg-[#f2f4f7] p-3">Needs dock swimming, four suites, child-safe beach guidance, and payment schedule.</p>
                    <p className="rounded-2xl bg-[#eff6ff] p-3 text-[#1d4ed8]">Draft reply ready: dates, local guide, quote context, and next question.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2563eb]">Discover DirectStay</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight tracking-[-0.06em] text-[#101828] md:text-6xl">
              Chatbot in the corner? No. Direct booking woven into the experience.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#475467] lg:justify-self-end">
            Guests should not have to decode a listing, wait in a marketplace inbox, or guess whether the property team understands their trip. DirectStay turns property content, local knowledge, and owner rules into a guided path to booking.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {conversionFeatures.map((feature) => (
            <article key={feature.title} className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,0.06)]">
              <div className="mb-8 h-12 w-12 rounded-2xl bg-[#eff6ff]" />
              <h3 className="font-display text-3xl leading-none tracking-[-0.05em] text-[#101828]">{feature.title}</h3>
              <p className="mt-5 text-sm leading-7 text-[#5f6b7a]">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ai" className="bg-[#101828] px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#93c5fd]">AI-assisted, owner-controlled</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.06em] md:text-6xl">The back office should help sell the stay.</h2>
            <p className="mt-6 text-lg leading-8 text-white/70">
              DirectStay uses AI where it reduces friction: inquiry summaries, missing-detail flags, lead scoring, suggested next actions, and owner-approved replies. Not autonomous chaos in a linen shirt.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {journey.map(([step, title, body]) => (
              <article key={step} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                <p className="font-display text-5xl tracking-[-0.08em] text-[#93c5fd]">{step}</p>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/64">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="owners" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="rounded-[2.5rem] border border-black/10 bg-white p-5 shadow-[0_18px_55px_rgba(16,24,40,0.08)] md:p-7">
            <div className="rounded-[2rem] bg-[#f2f4f7] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563eb]">Owner controls</p>
                  <h3 className="mt-1 font-display text-3xl tracking-[-0.06em]">Configure the direct stay</h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#475467]">Guardrails on</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ownerControls.map((control) => (
                  <div key={control} className="rounded-2xl bg-white p-4 text-sm font-semibold text-[#344054]">
                    {control}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2563eb]">For owners</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.06em] text-[#101828] md:text-6xl">
              Less marketplace dependency. More owner equity.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#475467]">
              DirectStay gives the property its own conversion surface: a polished site, a better inquiry workflow, a growing customer record, and data the owner can actually use for repeat bookings.
            </p>
          </div>
        </div>
      </section>

      <section id="property" className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-[0_28px_90px_rgba(16,24,40,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[360px]">
            <Image src="/images/pool-lounge-ocean.jpg" alt="Villa La Percha pool facing the ocean" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 48vw" />
          </div>
          <div className="p-8 md:p-12 lg:p-14">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#2563eb]">First DirectStay home</p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.06em] text-[#101828] md:text-6xl">Villa La Percha proves the model.</h2>
            <p className="mt-6 text-lg leading-8 text-[#475467]">
              A private Chalk Sound villa with four en-suite bedrooms, dock swimming, kayaks, paddleboards, pool, hot tub, island guide, and a direct booking path designed around the guest experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/villa-la-percha" className="inline-flex items-center justify-center rounded-full bg-[#101828] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#263142]">
                Open property site
              </Link>
              <Link href="/villa-la-percha/experience-the-island" className="inline-flex items-center justify-center rounded-full border border-[#101828]/15 px-7 py-4 text-sm font-bold text-[#101828] transition hover:border-[#2563eb]/30 hover:text-[#2563eb]">
                Explore island guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-[#2563eb] p-8 text-white shadow-[0_28px_90px_rgba(37,99,235,0.28)] md:p-12 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/65">DirectStay network</p>
              <h2 className="mt-4 max-w-4xl font-display text-4xl leading-tight tracking-[-0.06em] md:text-6xl">
                Starting curated. Built to scale carefully.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
                We are focused on homes where direct booking can genuinely improve the stay: strong presentation, clear communication, useful local guidance, and owners who care about what happens after the inquiry.
              </p>
            </div>
            <a href="mailto:necteau@gmail.com?subject=DirectStay%20inquiry" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-black text-[#1d4ed8] transition hover:bg-[#eff6ff]">
              Contact DirectStay
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
