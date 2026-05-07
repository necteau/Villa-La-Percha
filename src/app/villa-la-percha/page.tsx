import type { Metadata } from "next";
import PropertySiteHome from "@/components/PropertySiteHome";
import Link from "next/link";
import { villaSeoGuides } from "@/data/seoGuides";
import { villaLaPerchaBreadcrumbs, villaLaPerchaEntity } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Villa La Percha | Private villa in Chalk Sound, Providenciales — Book direct",
  description:
    "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming and fishing, kayaks, paddleboards, a private pool and hot tub, Sonos throughout.",
  alternates: {
    canonical: "/villa-la-percha",
  },
  keywords: [
    "Villa La Percha",
    "Chalk Sound villa rental",
    "Providenciales private villa",
    "Turks and Caicos direct villa rental",
    "book Villa La Percha direct",
    "Sapodilla Bay villa",
    "Taylor Bay villa",
    "Turks and Caicos family villa",
    "private pool villa Providenciales",
  ],
  openGraph: {
    title: "Villa La Percha | Private villa in Chalk Sound, Providenciales",
    description:
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming and fishing, kayaks, paddleboards, private pool, hot tub, and Sonos throughout.",
    url: "/villa-la-percha",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/aerial-house-ocean-neighbors.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha aerial view",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa La Percha | Private villa in Chalk Sound, Providenciales",
    description:
      "Book Villa La Percha directly and save 15–30% vs. Airbnb and VRBO. Four en-suite bedrooms, dock swimming, kayaks, paddleboards, pool, hot tub, and Sonos throughout.",
    images: ["/images/aerial-house-ocean-neighbors.jpg"],
  },
};

export default function VillaLaPerchaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(villaLaPerchaEntity) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(villaLaPerchaBreadcrumbs) }}
      />
      <PropertySiteHome />
      <section className="bg-[#FAFAF8] px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl rounded-[34px] bg-white p-7 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Planning guides</p>
          <h2 className="mt-4 font-display text-3xl font-light leading-tight text-[#181612] md:text-5xl">
            More ways to plan a direct Villa La Percha stay.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {villaSeoGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/villa-la-percha/guides/${guide.slug}`}
                className="rounded-2xl border border-[#e8e0d2] bg-[#fbfaf7] p-5 transition hover:-translate-y-0.5 hover:border-[#8B7355]/45 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8B7355]">{guide.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight text-[#181612]">{guide.title.replace(" | Villa La Percha", "")}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5b554b]">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
