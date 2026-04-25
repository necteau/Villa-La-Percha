import { faqs, getFaqJsonLd } from "@/data/faq";

interface Props {
  includeStructuredData?: boolean;
}

export default function FAQ({ includeStructuredData = false }: Props) {
  const faqJsonLd = getFaqJsonLd();

  return (
    <section className="py-20 md:py-28 bg-[#FAFAF8]">
      {includeStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Questions Answered
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Frequently Asked Questions
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto text-[#6B6B6B] leading-relaxed">
            The practical things guests usually want to know before they reach out.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-[#E8E4DF] bg-white px-6 py-5 shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="font-medium text-[#2C2C2C] text-base md:text-lg">{faq.question}</span>
                <span className="text-[#8B7355] text-2xl leading-none transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 pr-8 text-sm md:text-base leading-relaxed text-[#6B6B6B]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
