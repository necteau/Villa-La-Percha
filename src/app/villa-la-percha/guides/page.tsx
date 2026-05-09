import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { villaSeoGuides } from "@/data/seoGuides";

export const metadata: Metadata = {
  title: "Villa La Percha Planning Guides | Chalk Sound, Providenciales, and Direct Booking",
  description:
    "Planning guides for Villa La Percha guests comparing Chalk Sound, private villa rentals, pool villas, and direct booking in Turks and Caicos.",
  alternates: {
    canonical: "/villa-la-percha/guides",
  },
  openGraph: {
    title: "Villa La Percha Planning Guides",
    description:
      "Helpful Villa La Percha planning guides for Chalk Sound, Providenciales, private pool stays, and booking direct.",
    url: "/villa-la-percha/guides",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha aerial view over Chalk Sound",
      },
    ],
  },
};

export default function VillaGuidesIndexPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#2C2C2C]">
      <section className="relative overflow-hidden bg-[#10261f] text-white">
        <Image
          src="/images/aerial-house-ocean-neighbors.jpg"
          alt="Villa La Percha aerial view over Chalk Sound"
          fill
          priority
          className="object-cover opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071414] via-[#071414]/90 to-[#071414]/42" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-white/68">Villa La Percha planning library</p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[0.98] md:text-7xl">
            Plan a smarter Chalk Sound villa stay.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/82">
            Practical guides for choosing a Turks and Caicos villa, understanding Chalk Sound, comparing private-pool stays, and booking directly with confidence.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link href="/villa-la-percha" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#10261f] transition hover:bg-[#f2efe8]">
              View the villa
            </Link>
            <Link href="/villa-la-percha/experience-the-island" className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Explore the island guide
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-6 md:grid-cols-2">
          {villaSeoGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/villa-la-percha/guides/${guide.slug}`}
              className="group overflow-hidden rounded-[34px] bg-white shadow-[0_18px_55px_rgba(31,31,27,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(31,31,27,0.12)]"
            >
              <div className="relative aspect-[16/10]">
                <Image src={guide.heroImage} alt={guide.heroAlt} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                <p className="absolute bottom-5 left-5 right-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/78">{guide.eyebrow}</p>
              </div>
              <div className="p-7 md:p-8">
                <h2 className="font-display text-3xl font-light leading-tight text-[#181612] md:text-4xl">
                  {guide.title.replace(" | Villa La Percha", "")}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5b554b] md:text-base">{guide.description}</p>
                <p className="mt-6 text-sm font-semibold text-[#8B7355]">Read the guide →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 text-center md:px-10 md:pb-28">
        <div className="rounded-[34px] bg-[#efe8dc] p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Ready to compare dates?</p>
          <h2 className="mt-4 font-display text-4xl font-light leading-tight text-[#181612] md:text-5xl">See the villa, amenities, and direct-booking path.</h2>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/villa-la-percha#availability" className="rounded-full bg-[#8B7355] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#765f46]">
              Check availability
            </Link>
            <Link href="/villa-la-percha/faq" className="rounded-full border border-[#8B7355]/30 px-7 py-3 text-sm font-semibold text-[#3f392f] transition hover:bg-white/50">
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
