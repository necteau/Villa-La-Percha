import Link from "next/link";

type PlanningGuideLink = {
  slug: string;
  title: string;
};

type FooterProps = {
  planningGuides?: PlanningGuideLink[];
};

export default function Footer({ planningGuides = [] }: FooterProps) {
  return (
    <footer className="py-10 md:py-12 bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-white/30 text-xs tracking-wider text-center md:text-left">
            © {new Date().getFullYear()} Villa La Percha · Providenciales, Turks &amp; Caicos
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a href="#about" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
              About
            </a>
            <a href="#gallery" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
              Gallery
            </a>
            <Link href="/villa-la-percha/experience-the-island" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
              Experience
            </Link>
            <Link href="/villa-la-percha/faq" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
              FAQ
            </Link>
            <a href="#contact" className="text-white/30 text-xs tracking-wider hover:text-white/60 transition-colors uppercase">
              Contact
            </a>
          </div>
        </div>
        {planningGuides.length > 0 && (
          <div className="border-t border-white/10 pt-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/25">Planning guides</p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {planningGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/villa-la-percha/guides/${guide.slug}`}
                  className="text-xs text-white/25 underline-offset-4 transition-colors hover:text-white/55 hover:underline"
                >
                  {guide.title.replace(" | Villa La Percha", "")}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
