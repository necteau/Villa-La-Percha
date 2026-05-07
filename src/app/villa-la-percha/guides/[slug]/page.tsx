import type { Metadata } from "next";
import Image from "next/image";
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
          url: guide.heroImage,
          width: 1200,
          height: 630,
          alt: guide.heroAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [guide.heroImage],
    },
  };
}

export default async function VillaSeoGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getSeoGuide(slug);

  if (!guide) notFound();

  const relatedGuides = villaSeoGuides.filter((item) => item.slug !== guide.slug).slice(0, 3);

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
    image: `${siteUrl}${guide.heroImage}`,
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

      <section className="relative min-h-[82vh] overflow-hidden bg-[#10261f] text-white">
        <Image src={guide.heroImage} alt={guide.heroAlt} fill priority className="object-cover opacity-42" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071414] via-[#071414]/88 to-[#071414]/38" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAFAF8] to-transparent" />
        <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-10 px-6 py-20 md:px-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-white/68">{guide.eyebrow}</p>
            <h1 className="max-w-4xl font-display text-5xl font-light leading-[0.98] md:text-7xl">{guide.h1}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/82">{guide.intro}</p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link href="/villa-la-percha#availability" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#10261f] transition hover:bg-[#f2efe8]">
                Check availability
              </Link>
              <Link href="/villa-la-percha" className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View the villa
              </Link>
            </div>
          </div>
          <aside className="rounded-[34px] border border-white/16 bg-white/12 p-6 shadow-2xl backdrop-blur-md">
            <p className="font-display text-3xl leading-tight text-white">{guide.pullQuote}</p>
            <div className="mt-6 h-px bg-white/18" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/58">Best for</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/78">
              {guide.bestFor.map((item) => (
                <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-8 md:px-10 md:pb-24 lg:grid-cols-[1fr_0.38fr]">
        <article className="space-y-8">
          <section className="rounded-[34px] border border-[#d8c8ac] bg-[#fffaf0] p-7 shadow-[0_14px_38px_rgba(31,31,27,0.06)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Short answer</p>
            <h2 className="mt-3 font-display text-3xl font-light leading-tight text-[#181612] md:text-4xl">What this page says in one clean answer</h2>
            <p className="mt-4 text-base leading-8 text-[#4f473c] md:text-lg">{guide.answerBox}</p>
          </section>

          <div className="grid gap-5 md:grid-cols-3">
            {guide.featureCards.map((card) => (
              <div key={card.title} className="rounded-[26px] border border-[#e8e0d2] bg-white p-6 shadow-[0_14px_38px_rgba(31,31,27,0.06)]">
                <h2 className="font-display text-2xl leading-tight text-[#181612]">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5b554b]">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-[36px] bg-white shadow-[0_18px_55px_rgba(31,31,27,0.08)]">
            <div className="relative aspect-[16/9]">
              <Image src={guide.secondaryImage} alt={guide.secondaryAlt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 780px" />
            </div>
            <div className="space-y-12 p-7 md:p-10">
              {guide.sections.map((section, index) => (
                <section key={section.heading} className={index === 0 ? "" : "border-t border-[#ece4d7] pt-10"}>
                  {section.kicker && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-[#8B7355]">{section.kicker}</p>}
                  <h2 className="font-display text-3xl font-light leading-tight text-[#181612] md:text-5xl">{section.heading}</h2>
                  <p className="mt-5 text-base leading-8 text-[#5b554b] md:text-lg">{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          <section className="rounded-[34px] bg-[#10261f] p-7 text-white md:p-10">
            <div className="grid gap-8 md:grid-cols-[0.78fr_1fr] md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Know before you book</p>
                <h2 className="mt-4 font-display text-3xl font-light leading-tight md:text-5xl">Practical details, clearly stated.</h2>
              </div>
              <ul className="space-y-4 text-sm leading-7 text-white/76 md:text-base">
                {guide.knowBeforeYouBook.map((item) => (
                  <li key={item} className="flex gap-3"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-white/70" />{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-[34px] bg-white p-7 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Fact box for search and AI answers</p>
                <h2 className="mt-4 font-display text-3xl font-light leading-tight text-[#181612] md:text-4xl">Canonical facts</h2>
                <p className="mt-4 text-sm leading-7 text-[#6B6B6B]">{guide.sourceNote}</p>
              </div>
              <dl className="grid gap-3">
                {guide.facts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-[#e8e0d2] bg-[#fbfaf7] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B7355]">{fact.label}</dt>
                    <dd className="mt-1 text-sm leading-6 text-[#3f392f]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="rounded-[34px] bg-white p-7 shadow-[0_18px_55px_rgba(31,31,27,0.07)] md:p-10">
            <h2 className="font-display text-3xl font-light text-[#181612] md:text-5xl">Common questions</h2>
            <div className="mt-7 space-y-4">
              {guide.faqs.map((faq) => (
                <details key={faq.question} className="group rounded-2xl border border-[#e8e0d2] bg-[#fbfaf7] px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#2C2C2C]">
                    {faq.question}
                    <span className="text-2xl leading-none text-[#8B7355] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-[#5b554b]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[30px] bg-[#efe8dc] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Plan the stay</p>
            <nav className="mt-5 flex flex-col gap-3 text-sm font-semibold text-[#1f1f1b]">
              <Link href="/villa-la-percha/faq" className="hover:text-[#8B7355]">Villa FAQ</Link>
              <Link href="/villa-la-percha/experience-the-island" className="hover:text-[#8B7355]">Island guide</Link>
              <Link href="/villa-la-percha/experience-the-island/itinerary" className="hover:text-[#8B7355]">Sample itinerary</Link>
              <Link href="/villa-la-percha#availability" className="hover:text-[#8B7355]">Check availability</Link>
            </nav>
          </div>

          <div className="rounded-[30px] bg-white p-6 shadow-[0_14px_38px_rgba(31,31,27,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7355]">Related guides</p>
            <div className="mt-5 space-y-4">
              {relatedGuides.map((related) => (
                <Link key={related.slug} href={`/villa-la-percha/guides/${related.slug}`} className="block border-t border-[#eee6da] pt-4 first:border-t-0 first:pt-0">
                  <p className="font-display text-xl leading-tight text-[#181612] hover:text-[#8B7355]">{related.title.replace(" | Villa La Percha", "")}</p>
                  <p className="mt-2 text-xs leading-5 text-[#6B6B6B]">{related.description}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-[#1a1916] p-6 text-white">
            <p className="font-display text-3xl leading-tight">Villa La Percha</p>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Four en-suite bedrooms, private pool, hot tub, dock swimming, kayaks, paddleboards, and a direct booking path in Providenciales.
            </p>
            <Link href="/villa-la-percha" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1a1916]">
              Open property page
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
