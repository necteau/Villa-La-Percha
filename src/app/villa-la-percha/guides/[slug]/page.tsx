import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoGuide, villaSeoGuides } from "@/data/seoGuides";
import { siteUrl, villaLaPerchaBreadcrumbs, villaLaPerchaEntity } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return villaSeoGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSeoGuide(slug);

  if (!guide) return {};

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `/villa-la-percha/guides/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/villa-la-percha/guides/${guide.slug}`,
      siteName: "DirectStay",
      type: "article",
      images: [
        {
          url: "/images/aerial-pool-house-chalk-sound.jpg",
          width: 1200,
          height: 630,
          alt: "Villa La Percha in Chalk Sound, Providenciales",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: ["/images/aerial-pool-house-chalk-sound.jpg"],
    },
  };
}

export default async function VillaSeoGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getSeoGuide(slug);

  if (!guide) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    mainEntityOfPage: `${siteUrl}/villa-la-percha/guides/${guide.slug}`,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    about: {
      "@id": `${siteUrl}/villa-la-percha#vacation-rental`,
    },
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#2C2C2C]">
      {[villaLaPerchaEntity, villaLaPerchaBreadcrumbs, faqJsonLd, articleJsonLd].map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}

      <section className="bg-[#10261f] px-6 py-20 text-white md:px-8 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-white/65">{guide.eyebrow}</p>
          <h1 className="font-display text-4xl font-light leading-tight md:text-6xl">{guide.h1}</h1>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/76 md:text-lg">{guide.intro}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/villa-la-percha#availability" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#10261f] transition hover:bg-[#f2efe8]">
              Check availability
            </Link>
            <Link href="/villa-la-percha" className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              View Villa La Percha
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:px-8 md:py-20 lg:grid-cols-[1fr_0.34fr]">
        <article className="rounded-[34px] bg-white p-7 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-10">
          <div className="space-y-10">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-3xl font-light leading-tight text-[#181612] md:text-4xl">{section.heading}</h2>
                <p className="mt-4 text-base leading-8 text-[#5b554b]">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-[#e8e0d2] pt-10">
            <h2 className="font-display text-3xl font-light text-[#181612] md:text-4xl">Common questions</h2>
            <div className="mt-6 space-y-4">
              {guide.faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border border-[#e8e0d2] bg-[#fbfaf7] px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-[#2C2C2C]">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-[#5b554b]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-4">
          <div className="rounded-[28px] bg-[#efe8dc] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Plan the stay</p>
            <nav className="mt-5 flex flex-col gap-3 text-sm font-semibold text-[#1f1f1b]">
              <Link href="/villa-la-percha/faq" className="hover:text-[#8B7355]">Villa FAQ</Link>
              <Link href="/villa-la-percha/experience-the-island" className="hover:text-[#8B7355]">Island guide</Link>
              <Link href="/villa-la-percha/experience-the-island/itinerary" className="hover:text-[#8B7355]">Sample itinerary</Link>
              <Link href="/villa-la-percha#availability" className="hover:text-[#8B7355]">Check availability</Link>
            </nav>
          </div>
          <div className="rounded-[28px] bg-[#1a1916] p-6 text-white">
            <p className="font-display text-3xl leading-tight">Villa La Percha</p>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Four en-suite bedrooms, private pool, hot tub, dock swimming, kayaks, paddleboards, and a direct booking path in Providenciales.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
